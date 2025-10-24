import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { reference, orderId } = await request.json()

    if (!reference || !orderId) {
      return NextResponse.json(
        { success: false, message: "Reference and orderId are required" },
        { status: 400 }
      )
    }

    // Verify payment with Paystack
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY
    if (!paystackSecretKey) {
      console.error("Paystack secret key not configured")
      return NextResponse.json(
        { success: false, message: "Payment gateway not configured" },
        { status: 500 }
      )
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
      return NextResponse.json(
        { success: false, message: "Payment verification failed" },
        { status: 400 }
      )
    }

    // Check if order exists and belongs to user
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
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
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      )
    }

    // Update payment and order status
    await prisma.$transaction([
      prisma.payment.update({
        where: { orderId: order.id },
        data: {
          status: "paid",
          transactionId: reference,
          paidAt: new Date(),
          metadata: {
            paystackData: verifyData.data,
          },
        },
      }),
      prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "paid",
          status: "processing",
        },
      }),
    ])

    // Clear user's cart after successful payment
    try {
      const cart = await prisma.cart.findUnique({
        where: { userId },
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
        const { sendOrderConfirmationEmail } = await import('@/lib/email/send-order-email')
        await sendOrderConfirmationEmail(
          updatedOrder.user.email,
          updatedOrder.user.name,
          {
            orderNumber: updatedOrder.orderNumber,
            createdAt: updatedOrder.createdAt,
            subtotal: Number(updatedOrder.subtotal),
            tax: Number(updatedOrder.tax),
            shipping: Number(updatedOrder.shipping),
            discount: Number(updatedOrder.discount),
            totalAmount: Number(updatedOrder.totalAmount),
            orderItems: updatedOrder.orderItems.map(item => ({
              productName: item.productName,
              quantity: item.quantity,
              unitPrice: Number(item.unitPrice),
              totalPrice: Number(item.totalPrice),
            })),
            shippingAddress: updatedOrder.shippingAddress || undefined,
            paymentStatus: 'paid',
            status: 'processing',
          }
        )
      } catch (emailError) {
        console.error('Failed to send order confirmation email:', emailError)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: "processing",
        paymentStatus: "paid",
      },
    })
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json(
      { success: false, message: "Failed to verify payment" },
      { status: 500 }
    )
  }
}
