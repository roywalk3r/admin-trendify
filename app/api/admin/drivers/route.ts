import { NextRequest } from "next/server"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { adminAuthMiddleware } from "@/lib/admin-auth"

const driverSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email().optional(),
  licenseNo: z.string().min(3),
  vehicleType: z.string().min(2),
  vehicleNo: z.string().min(2),
  isActive: z.boolean().optional(),
})

export async function GET(req: NextRequest) {
  const authRes = await adminAuthMiddleware(req)
  if (authRes.status !== 200) return authRes

  try {
    const url = new URL(req.url)
    const search = url.searchParams.get("search") || ""
    const active = url.searchParams.get("active")
    const page = Number(url.searchParams.get("page") || "1")
    const limit = Number(url.searchParams.get("limit") || "20")

    const where: any = {}
    if (search) where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
      { licenseNo: { contains: search, mode: "insensitive" } },
    ]
    if (active === "true") where.isActive = true
    if (active === "false") where.isActive = false

    const skip = (page - 1) * limit

    const [drivers, total] = await Promise.all([
      prisma.driver.findMany({ 
        where, 
        orderBy: { createdAt: "desc" }, 
        skip, 
        take: limit,
        include: {
          _count: { select: { orders: true } }
        }
      }),
      prisma.driver.count({ where }),
    ])

    return createApiResponse({
      data: {
        drivers,
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

export async function POST(req: NextRequest) {
  const authRes = await adminAuthMiddleware(req)
  if (authRes.status !== 200) return authRes

  try {
    const body = await req.json()
    const payload = driverSchema.parse(body)

    const created = await prisma.driver.create({
      data: {
        ...payload,
        isActive: payload.isActive ?? true,
      },
    })

    return createApiResponse({ data: created, status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
