import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { adminAuthMiddleware } from "@/lib/admin-auth"
import { withRateLimit } from "@/lib/rate-limit"

async function handler(req: NextRequest) {
  const authRes = await adminAuthMiddleware(req)
  if (authRes.status !== 200) return authRes

  try {
    const url = new URL(req.url)
    const status = url.searchParams.get("status")
    const page = Number(url.searchParams.get("page") || "1")
    const limit = Number(url.searchParams.get("limit") || "20")

    const where: any = {}
    if (status) where.status = status

    const skip = (page - 1) * limit

    const [refunds, total, stats] = await Promise.all([
      prisma.refund.findMany({ 
        where, 
        orderBy: { createdAt: "desc" }, 
        skip, 
        take: limit,
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              totalAmount: true,
              user: { select: { name: true, email: true } }
            }
          }
        }
      }),
      prisma.refund.count({ where }),
      prisma.refund.aggregate({
        _sum: { amount: true },
        where: { status: "completed" }
      })
    ])

    const pendingStats = await prisma.refund.aggregate({
      _sum: { amount: true },
      _count: true,
      where: { status: "pending" }
    })

    return createApiResponse({
      data: {
        refunds,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        stats: {
          totalRefunded: Number(stats._sum.amount || 0),
          pendingAmount: Number(pendingStats._sum.amount || 0),
          pendingCount: pendingStats._count || 0
        }
      },
      status: 200,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export const GET = withRateLimit(handler, { limit: 100, windowSeconds: 60 })
