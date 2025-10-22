import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { logInfo } from "@/lib/logger"

/**
 * Admin: Get all return requests
 * GET /api/admin/returns
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

    // TODO: Verify user is admin
    // const user = await prisma.user.findUnique({ where: { clerkId: userId } })
    // if (user?.role !== 'admin') { return 403 }

    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get("page") || "1")
    const limit = parseInt(url.searchParams.get("limit") || "20")
    const status = url.searchParams.get("status")
    const skip = (page - 1) * limit

    const where: any = {}
    if (status) {
      where.status = status
    }

    const [returns, total, statusCounts] = await Promise.all([
      prisma.return.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.return.count({ where }),
      // Get counts by status
      prisma.return.groupBy({
        by: ["status"],
        _count: true,
      }),
    ])

    // Format status counts
    const counts = statusCounts.reduce((acc: any, item) => {
      acc[item.status] = item._count
      return acc
    }, {})

    return createApiResponse({
      data: {
        returns,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        statusCounts: counts,
      },
      status: 200,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
