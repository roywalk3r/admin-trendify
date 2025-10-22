import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"
import { createApiResponse, handleApiError, checkRateLimit } from "@/lib/api-utils"
import { logInfo } from "@/lib/logger"
import { sendReturnApprovedEmail } from "@/lib/email"

const createReturnSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  orderItemIds: z.array(z.string()).min(1, "At least one item must be selected"),
  reason: z.string().min(1, "Reason is required"),
  reasonDetails: z.string().optional(),
  images: z.array(z.string().url()).optional(),
})

/**
 * POST /api/returns - Create a return request
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return createApiResponse({
        error: "Unauthorized - Please sign in",
        status: 401,
      })
    }

    // Rate limiting - 3 return requests per hour
    const isRateLimited = await checkRateLimit(`${userId}:returns`, 3, 3600)
    if (isRateLimited) {
      return createApiResponse({
        error: "Too many return requests. Please try again later.",
        status: 429,
      })
    }

    const body = await req.json()
    const validatedData = createReturnSchema.parse(body)

    // Verify order belongs to user
    const order = await prisma.order.findFirst({
      where: {
        id: validatedData.orderId,
        userId,
      },
      include: {
        orderItems: {
          where: {
            id: { in: validatedData.orderItemIds },
          },
        },
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
        error: "Order not found or does not belong to you",
        status: 404,
      })
    }

    // Check if order is eligible for return (within 30 days, delivered)
    const orderAge = Date.now() - order.createdAt.getTime()
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000

    if (orderAge > thirtyDaysInMs) {
      return createApiResponse({
        error: "Return window has expired (30 days from order date)",
        status: 400,
      })
    }

    if (order.status !== "delivered") {
      return createApiResponse({
        error: "Order must be delivered before requesting a return",
        status: 400,
      })
    }

    // Calculate refund amount
    const refundAmount = order.orderItems.reduce(
      (sum, item) => sum + Number(item.totalPrice),
      0
    )

    // Create return request
    const returnRequest = await prisma.return.create({
      data: {
        orderId: validatedData.orderId,
        orderItemIds: validatedData.orderItemIds,
        reason: validatedData.reason,
        reasonDetails: validatedData.reasonDetails,
        refundAmount,
        images: validatedData.images || [],
        status: "pending", // Admin will review
      },
    })

    logInfo("Return request created", {
      returnId: returnRequest.id,
      orderId: validatedData.orderId,
      userId,
      refundAmount,
    })

    // TODO: Send notification to admin
    // await sendAdminNotification("New return request", returnRequest)

    return createApiResponse({
      data: {
        returnId: returnRequest.id,
        status: returnRequest.status,
        message: "Return request submitted successfully. We'll review it within 24 hours.",
      },
      status: 201,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * GET /api/returns - Get user's return requests
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return createApiResponse({
        error: "Unauthorized",
        status: 401,
      })
    }

    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get("page") || "1")
    const limit = parseInt(url.searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Get user's orders to filter returns
    const userOrders = await prisma.order.findMany({
      where: { userId },
      select: { id: true },
    })

    const orderIds = userOrders.map((o) => o.id)

    // Get returns for user's orders
    const [returns, total] = await Promise.all([
      prisma.return.findMany({
        where: {
          orderId: { in: orderIds },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.return.count({
        where: {
          orderId: { in: orderIds },
        },
      }),
    ])

    return createApiResponse({
      data: {
        returns,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      status: 200,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
