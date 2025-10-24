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
    const status = url.searchParams.get("status") // "pending", "approved", "rejected"
    const search = url.searchParams.get("search") || ""
    const page = Number(url.searchParams.get("page") || "1")
    const limit = Number(url.searchParams.get("limit") || "20")

    const where: any = { deletedAt: null }
    
    if (status === "pending") where.isApproved = false
    if (status === "approved") where.isApproved = true
    if (search) {
      where.OR = [
        { comment: { contains: search, mode: "insensitive" } },
        { title: { contains: search, mode: "insensitive" } },
        { user: { email: { contains: search, mode: "insensitive" } } }
      ]
    }

    const skip = (page - 1) * limit

    const [reviews, total, stats] = await Promise.all([
      prisma.review.findMany({ 
        where, 
        orderBy: { createdAt: "desc" }, 
        skip, 
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true } },
          product: { select: { id: true, name: true, images: true } }
        }
      }),
      prisma.review.count({ where }),
      prisma.review.groupBy({
        by: ['isApproved'],
        _count: true,
        where: { deletedAt: null }
      })
    ])

    const statsObj = {
      pending: stats.find(s => !s.isApproved)?._count || 0,
      approved: stats.find(s => s.isApproved)?._count || 0,
      total: stats.reduce((sum, s) => sum + s._count, 0)
    }

    return createApiResponse({
      data: {
        reviews,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
        stats: statsObj
      },
      status: 200,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export const GET = withRateLimit(handler, { limit: 100, windowSeconds: 60 })
