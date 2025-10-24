import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { adminAuthMiddleware } from "@/lib/admin-auth"

export async function GET(req: NextRequest) {
  const authRes = await adminAuthMiddleware(req)
  if (authRes.status !== 200) return authRes

  try {
    const url = new URL(req.url)
    const productId = url.searchParams.get("productId")
    const notified = url.searchParams.get("notified")
    const page = Number(url.searchParams.get("page") || "1")
    const limit = Number(url.searchParams.get("limit") || "50")

    const where: any = {}
    if (productId) where.productId = productId
    if (notified === "true") where.notified = true
    if (notified === "false") where.notified = false

    const skip = (page - 1) * limit

    const [alerts, total, groupedByProduct] = await Promise.all([
      prisma.stockAlert.findMany({ 
        where, 
        orderBy: { createdAt: "desc" }, 
        skip, 
        take: limit 
      }),
      prisma.stockAlert.count({ where }),
      prisma.stockAlert.groupBy({
        by: ['productId'],
        _count: true,
        where: { notified: false }
      })
    ])

    return createApiResponse({
      data: {
        alerts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        stats: {
          pending: groupedByProduct.length,
          totalPending: groupedByProduct.reduce((sum, g) => sum + g._count, 0)
        }
      },
      status: 200,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
