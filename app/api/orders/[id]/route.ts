import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { adminAuthMiddleware } from "@/lib/admin-auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check admin authentication
    const authResponse = await adminAuthMiddleware(request)
    if (authResponse.status !== 200) {
      return authResponse
    }
    const orderId = params.id

    // Fetch the order with related data
    const order = await prisma.order.findUnique({
      where: { id: orderId },
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

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch order" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check admin authentication
    const authResponse = await adminAuthMiddleware(request)
    if (authResponse.status !== 200) {
      return authResponse
    }
    const orderId = params.id
    const { status, paymentStatus } = await request.json()

    // Validate input
    if (!status && !paymentStatus) {
      return NextResponse.json({ success: false, message: "No update data provided" }, { status: 400 })
    }

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!existingOrder) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {}
    if (status) updateData.status = status
    if (paymentStatus) updateData.paymentStatus = paymentStatus

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    })

    // If payment status is updated, also update the payment record
    if (paymentStatus) {
      await prisma.payment.updateMany({
        where: { orderId },
        data: { paymentStatus },
      })
    }

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      order: updatedOrder,
    })
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ success: false, message: "Failed to update order" }, { status: 500 })
  }
}
