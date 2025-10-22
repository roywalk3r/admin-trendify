import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { logInfo } from "@/lib/logger"
import { sendReturnApprovedEmail } from "@/lib/email"

type RouteContext = {
  params: Promise<{ id: string }>
}

const updateReturnSchema = z.object({
  action: z.enum(["approve", "reject", "mark_received", "mark_refunded"]),
  adminNotes: z.string().optional(),
  restockFee: z.number().optional(),
  shippingCost: z.number().optional(),
  returnLabel: z.string().url().optional(),
})

/**
 * Admin: Update return request status
 * PATCH /api/admin/returns/[id]
 */
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { userId } = await auth()
    const { id } = await context.params

    if (!userId) {
      return createApiResponse({
        error: "Unauthorized",
        status: 401,
      })
    }

    // TODO: Verify admin role
    // const user = await prisma.user.findUnique({ where: { clerkId: userId } })
    // if (user?.role !== 'admin') { return 403 }

    const body = await req.json()
    const validatedData = updateReturnSchema.parse(body)

    const returnRequest = await prisma.return.findUnique({
      where: { id },
    })

    if (!returnRequest) {
      return createApiResponse({
        error: "Return request not found",
        status: 404,
      })
    }

    // Get order details for email
    const order = await prisma.order.findUnique({
      where: { id: returnRequest.orderId },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    })

    if (!order) {
      return createApiResponse({
        error: "Associated order not found",
        status: 404,
      })
    }

    let updateData: any = {
      adminNotes: validatedData.adminNotes,
      updatedAt: new Date(),
    }

    switch (validatedData.action) {
      case "approve":
        updateData.status = "approved"
        updateData.restockFee = validatedData.restockFee
        updateData.shippingCost = validatedData.shippingCost
        updateData.returnLabel = validatedData.returnLabel

        // Calculate final refund amount
        const baseRefund = Number(returnRequest.refundAmount)
        const restockFee = validatedData.restockFee || 0
        const shippingCost = validatedData.shippingCost || 0
        updateData.refundAmount = baseRefund - restockFee - shippingCost

        // Send approval email
        if (order.user?.email) {
          await sendReturnApprovedEmail(order.user.email, {
            returnId: id,
            orderNumber: order.orderNumber,
            customerName: order.user.name || "Customer",
            returnLabel: validatedData.returnLabel,
          })
        }
        break

      case "reject":
        updateData.status = "rejected"
        // TODO: Send rejection email with reason
        break

      case "mark_received":
        if (returnRequest.status !== "approved") {
          return createApiResponse({
            error: "Return must be approved before marking as received",
            status: 400,
          })
        }
        updateData.status = "received"
        updateData.receivedDate = new Date()
        break

      case "mark_refunded":
        if (returnRequest.status !== "received") {
          return createApiResponse({
            error: "Return must be received before marking as refunded",
            status: 400,
          })
        }
        updateData.status = "refunded"
        updateData.refundedDate = new Date()

        // TODO: Process actual refund via payment gateway
        // await processRefund(order.id, returnRequest.refundAmount)

        // Restock items
        for (const itemId of returnRequest.orderItemIds) {
          const orderItem = await prisma.orderItem.findUnique({
            where: { id: itemId },
          })
          if (orderItem) {
            await prisma.product.update({
              where: { id: orderItem.productId },
              data: {
                stock: { increment: orderItem.quantity },
              },
            })
          }
        }
        break
    }

    const updated = await prisma.return.update({
      where: { id },
      data: updateData,
    })

    logInfo(`Return ${validatedData.action}`, {
      returnId: id,
      orderId: returnRequest.orderId,
      action: validatedData.action,
      adminUserId: userId,
    })

    return createApiResponse({
      data: updated,
      status: 200,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * Admin: Get return request details
 * GET /api/admin/returns/[id]
 */
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { userId } = await auth()
    const { id } = await context.params

    if (!userId) {
      return createApiResponse({
        error: "Unauthorized",
        status: 401,
      })
    }

    // TODO: Verify admin role

    const returnRequest = await prisma.return.findUnique({
      where: { id },
    })

    if (!returnRequest) {
      return createApiResponse({
        error: "Return request not found",
        status: 404,
      })
    }

    // Get full order details
    const order = await prisma.order.findUnique({
      where: { id: returnRequest.orderId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        orderItems: {
          where: {
            id: { in: returnRequest.orderItemIds },
          },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                sku: true,
                stock: true,
              },
            },
          },
        },
        shippingAddress: true,
      },
    })

    return createApiResponse({
      data: {
        ...returnRequest,
        order,
      },
      status: 200,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
