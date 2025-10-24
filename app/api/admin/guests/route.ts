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
    const page = Number(url.searchParams.get("page") || "1")
    const limit = Number(url.searchParams.get("limit") || "20")

    const where: any = {}
    if (search) where.email = { contains: search, mode: "insensitive" }

    const skip = (page - 1) * limit

    const [sessions, total] = await Promise.all([
      prisma.guestSession.findMany({ 
        where, 
        orderBy: { createdAt: "desc" }, 
        skip, 
        take: limit 
      }),
      prisma.guestSession.count({ where }),
    ])

    return createApiResponse({
      data: {
        sessions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
      },
      status: 200,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
