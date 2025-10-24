import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { adminAuthMiddleware } from "@/lib/admin-auth"
import { z } from "zod"

const statusSchema = z.object({
  status: z.enum(["pending", "processing", "shipped", "delivered", "canceled"]),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authentication
    const authResponse = await adminAuthMiddleware(request)
    if (authResponse.status !== 200) {
      return authResponse
    }

    const orderId = params.id
    const body = await request.json()
    const { status, trackingNumber, notes } = statusSchema.parse(body)

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    })

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      )
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        trackingNumber: trackingNumber || existingOrder.trackingNumber,
        notes: notes || existingOrder.notes,
        ...(status === "delivered" && { deliveredAt: new Date() }),
      },
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
                price: true,
                images: true,
              },
            },
          },
        },
        payment: true,
        shippingAddress: true,
      },
    })

    // Send status update email to customer (non-blocking)
    try {
      const { sendOrderStatusUpdateEmail } = await import('@/lib/email/send-order-email')
      await sendOrderStatusUpdateEmail(
        updatedOrder.user.email,
        updatedOrder.user.name,
        updatedOrder.orderNumber,
        existingOrder.status,
        updatedOrder.status,
        trackingNumber
      )
    } catch (emailError) {
      // Log error but don't fail the status update
      console.error('Failed to send status update email:', emailError)
    }

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully",
      order: updatedOrder,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Invalid request data", errors: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating order status:", error)
    return NextResponse.json(
      { success: false, message: "Failed to update order status" },
      { status: 500 }
    )
  }
}
