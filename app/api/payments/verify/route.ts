import { type NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { sendOrderConfirmationEmail } from "@/lib/email"
import { finalizeOrderPayment } from "@/lib/finalize-order-payment"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return createApiResponse({ status: 401, error: "Unauthorized" })
    }

    const { reference, orderId } = await request.json()

    if (!reference || !orderId) {
      return createApiResponse({ status: 400, error: "Reference and orderId are required" })
    }

    // Verify payment with Paystack
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY
    if (!paystackSecretKey) {
      console.error("Paystack secret key not configured")
      return createApiResponse({ status: 500, error: "Payment gateway not configured" })
    }

    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          "Content-Type": "application/json",
        },
      }
    )

    const verifyData = await verifyResponse.json()

    if (!verifyData.status || verifyData.data.status !== "success") {
      return createApiResponse({ status: 400, error: "Payment verification failed" })
    }

    // Map Clerk userId to local user id for FK integrity
    const localUser = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!localUser) {
      return createApiResponse({ status: 404, error: "User not found" })
    }

    // Check if order exists and belongs to user
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: localUser.id,
      },
      include: {
        payment: true,
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    })

    if (!order) {
      return createApiResponse({ status: 404, error: "Order not found" })
    }

    await finalizeOrderPayment({
      orderId: order.id,
      provider: "paystack",
      reference,
      outcome: "paid",
      currency: (verifyData?.data?.currency || process.env.PAYSTACK_CURRENCY || process.env.NEXT_PUBLIC_CURRENCY || "GHS").toString().toUpperCase(),
      paidAmountMinor: verifyData?.data?.amount,
      gatewayFeeMinor: verifyData?.data?.fees,
      paidAt: verifyData?.data?.paid_at ? new Date(verifyData.data.paid_at) : new Date(),
      verifyPayload: verifyData.data,
    })

    // Clear user's cart after successful payment
    try {
      const cart = await prisma.cart.findUnique({
        where: { userId: localUser.id },
      })
      if (cart) {
        await prisma.cartItem.deleteMany({
          where: { cartId: cart.id },
        })
      }
    } catch (cartError) {
      console.error("Error clearing cart:", cartError)
      // Don't fail the payment verification if cart clearing fails
    }

    // Fetch updated order with all details
    const updatedOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        shippingAddress: true,
      },
    })

    // Send order confirmation email after payment verification (non-blocking)
    if (updatedOrder) {
      try {
        await sendOrderConfirmationEmail(updatedOrder.user.email, {
          orderNumber: updatedOrder.orderNumber,
          customerName: updatedOrder.user.name || updatedOrder.user.email.split("@")[0] || "Customer",
          items: updatedOrder.orderItems.map((item) => ({
            name: item.productName,
            quantity: item.quantity,
            price: Number(item.unitPrice),
          })),
          subtotal: Number(updatedOrder.subtotal),
          tax: Number(updatedOrder.tax),
          shipping: Number(updatedOrder.shipping),
          total: Number(updatedOrder.totalAmount),
          estimatedDelivery: updatedOrder.estimatedDelivery ? new Date(updatedOrder.estimatedDelivery).toLocaleDateString() : undefined,
        })
      } catch (emailError) {
        console.error('Failed to send order confirmation email:', emailError)
      }
    }

    return createApiResponse({
      status: 200,
      data: {
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: "processing",
          paymentStatus: "paid",
        },
      },
    })
  } catch (error) {
    console.error("Error verifying payment:", error)
    return handleApiError(error)
  }
}
