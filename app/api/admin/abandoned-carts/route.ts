import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { adminAuthMiddleware } from "@/lib/admin-auth"

export async function GET(req: NextRequest) {
  const authRes = await adminAuthMiddleware(req)
  if (authRes.status !== 200) return authRes

  try {
    const url = new URL(req.url)
    const search = url.searchParams.get("search") || ""
    const recovered = url.searchParams.get("recovered")
    const page = Number(url.searchParams.get("page") || "1")
    const limit = Number(url.searchParams.get("limit") || "20")

    const where: any = {}
    if (search) where.email = { contains: search, mode: "insensitive" }
    if (recovered === "true") where.recovered = true
    if (recovered === "false") where.recovered = false

    const skip = (page - 1) * limit

    const [carts, total, stats] = await Promise.all([
      prisma.abandonedCart.findMany({ 
        where, 
        orderBy: { cartValue: "desc" }, 
        skip, 
        take: limit 
      }),
      prisma.abandonedCart.count({ where }),
      prisma.abandonedCart.aggregate({
        _sum: { cartValue: true },
        _count: true,
        where: { recovered: false }
      })
    ])

    const recoveredStats = await prisma.abandonedCart.aggregate({
      _sum: { cartValue: true },
      _count: true,
      where: { recovered: true }
    })

    return createApiResponse({
      data: {
        carts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
        stats: {
          totalAbandoned: stats._count || 0,
          totalValue: Number(stats._sum.cartValue || 0),
          totalRecovered: recoveredStats._count || 0,
          recoveredValue: Number(recoveredStats._sum.cartValue || 0),
          recoveryRate: stats._count ? ((recoveredStats._count || 0) / stats._count) * 100 : 0
        }
      },
      status: 200,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
