import prisma from "@/lib/prisma"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import type { NextRequest } from "next/server"
import { z } from "zod"
import { auth } from "@clerk/nextjs/server"

// Order status validation schema
const orderStatusSchema = z.object({
  status: z.enum(["pending", "processing", "shipped", "delivered", "canceled"]),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
})

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params

    // Fetch order with all related data
    const order = await prisma.order.findUnique({
      where: { id },
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
                slug: true,
                images: true,
                price: true,
              },
            },
          },
        },
        shippingAddress: true,
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

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()

    // Check if user is authenticated
    if (!userId) {
      return createApiResponse({
        error: "Unauthorized",
        status: 401,
      })
    }

    const { id } = await context.params

    // Parse and validate request body
    const body = await req.json()
    const validatedData = orderStatusSchema.parse(body)

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id },
    })

    if (!existingOrder) {
      return createApiResponse({
        error: "Order not found",
        status: 404,
      })
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: validatedData.status,
        trackingNumber: validatedData.trackingNumber,
        notes: validatedData.notes,
        updatedAt: new Date(),
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
                slug: true,
                images: true,
                price: true,
              },
            },
          },
        },
        shippingAddress: true,
      },
    })

    return createApiResponse({
      data: updatedOrder,
      status: 200,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()

    // Check if user is authenticated
    if (!userId) {
      return createApiResponse({
        error: "Unauthorized",
        status: 401,
      })
    }

    const { id } = await context.params

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id },
    })

    if (!existingOrder) {
      return createApiResponse({
        error: "Order not found",
        status: 404,
      })
    }

    // Check if order can be deleted (only pending orders)
    if (existingOrder.status !== "pending") {
      return createApiResponse({
        error: "Only pending orders can be deleted",
        status: 409,
      })
    }

    // Delete order and related items
    await prisma.$transaction([
      prisma.orderItem.deleteMany({
        where: { orderId: id },
      }),
      prisma.order.delete({
        where: { id },
      }),
    ])

    return createApiResponse({
      data: { message: "Order deleted successfully" },
      status: 200,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
