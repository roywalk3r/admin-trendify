import type { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { z } from "zod"

// Validation schema for order status update
const updateOrderSchema = z.object({
  status: z.enum(["pending", "processing", "shipped", "delivered", "canceled"]).optional(),
  payment_status: z.enum(["unpaid", "paid", "refunded"]).optional(),
})

export async function GET(req: NextRequest, context: { params: { id: string } }) {
  try {
    // const orderId = await params.id
    const orderId = context.params.id // Check admin authorization

    // Get order with related data
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
                images: true,
              },
            },
          },
        },
        shippingAddress: true,
        payment: true,
      },
    })

    if (!order) {
      return createApiResponse({
        error: "Order not found",
        status: 404,
      })
    }

    return createApiResponse({
      data: order,
      status: 200,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  // Check admin authorization

  try {
    const orderId = params.id
    const body = await req.json()

    // Validate request body
    const validatedData = updateOrderSchema.parse(body)

    // Check if order exists
    const orderExists = await prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!orderExists) {
      return createApiResponse({
        error: "Order not found",
        status: 404,
      })
    }

    // Update order status
    const updateData: any = {}
    if (validatedData.status) {
      updateData.status = validatedData.status
    }
    if (validatedData.payment_status) {
      updateData.payment_status = validatedData.payment_status

      // Also update payment status if payment exists
      const payment = await prisma.payment.findUnique({
        where: { orderId },
      })

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { paymentStatus: validatedData.payment_status },
        })
      }
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    })

    return createApiResponse({
      data: updatedOrder,
      status: 200,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
