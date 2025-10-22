import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { logInfo } from "@/lib/logger"

type RouteContext = {
  params: Promise<{ id: string }>
}

/**
 * GET /api/returns/[id] - Get return request details
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

    const returnRequest = await prisma.return.findUnique({
      where: { id },

    })

    if (!returnRequest) {
      return createApiResponse({
        error: "Return request not found",
        status: 404,
      })
    }

    // Verify the return belongs to the user's order
    const order = await prisma.order.findFirst({
      where: {
        id: returnRequest.orderId,
        userId,
      },
      include: {
        orderItems: {
          where: {
            id: { in: returnRequest.orderItemIds },
          },
          include: {
            product: {
              select: {
                name: true,
                images: true,
              },
            },
          },
        },
      },
    })

    if (!order) {
      return createApiResponse({
        error: "Access denied",
        status: 403,
      })
    }

    return createApiResponse({
      data: {
        ...returnRequest,
        order: {
          orderNumber: order.orderNumber,
          items: order.orderItems,
        },
      },
      status: 200,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * PATCH /api/returns/[id] - Cancel a pending return request
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

    const body = await req.json()
    const action = body.action

    if (action !== "cancel") {
      return createApiResponse({
        error: "Invalid action. Only 'cancel' is allowed for users.",
        status: 400,
      })
    }

    const returnRequest = await prisma.return.findUnique({
      where: { id },
    })

    if (!returnRequest) {
      return createApiResponse({
        error: "Return request not found",
        status: 404,
      })
    }

    // Verify ownership
    const order = await prisma.order.findFirst({
      where: {
        id: returnRequest.orderId,
        userId,
      },
    })

    if (!order) {
      return createApiResponse({
        error: "Access denied",
        status: 403,
      })
    }

    // Can only cancel pending returns
    if (returnRequest.status !== "pending") {
      return createApiResponse({
        error: `Cannot cancel return with status: ${returnRequest.status}`,
        status: 400,
      })
    }

    // Update to rejected (user-cancelled)
    const updated = await prisma.return.update({
      where: { id },
      data: {
        status: "rejected",
        adminNotes: "Cancelled by customer",
        updatedAt: new Date(),
      },
    })

    logInfo("Return request cancelled by user", {
      returnId: id,
      orderId: returnRequest.orderId,
      userId,
    })

    return createApiResponse({
      data: updated,
      status: 200,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
