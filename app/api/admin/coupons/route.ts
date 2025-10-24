import { NextRequest } from "next/server"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { adminAuthMiddleware } from "@/lib/admin-auth"

const couponSchema = z.object({
  code: z.string().min(2).max(20),
  type: z.enum(["percentage", "fixed_amount"]),
  value: z.number().positive(),
  minPurchase: z.number().positive().optional(),
  maxDiscount: z.number().positive().optional(),
  productId: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  startDate: z.string().transform((v) => new Date(v)),
  endDate: z.string().transform((v) => new Date(v)),
  usageLimit: z.number().int().positive().optional(),
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

    const productId = url.searchParams.get("productId")
    const categoryId = url.searchParams.get("categoryId")
    const scope = url.searchParams.get("scope") // "global", "product", "category"

    const where: any = {}
    if (search) where.code = { contains: search, mode: "insensitive" }
    if (active === "true") where.isActive = true
    if (active === "false") where.isActive = false
    if (productId) where.productId = productId
    if (categoryId) where.categoryId = categoryId
    if (scope === "global") where.AND = [{ productId: null }, { categoryId: null }]
    if (scope === "product") where.productId = { not: null }
    if (scope === "category") where.categoryId = { not: null }

    const skip = (page - 1) * limit

    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({ 
        where, 
        orderBy: { createdAt: "desc" }, 
        skip, 
        take: limit,
        include: {
          product: { select: { id: true, name: true } },
          category: { select: { id: true, name: true } },
        }
      }),
      prisma.coupon.count({ where }),
    ])

    return createApiResponse({
      data: {
        coupons,
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
    const payload = couponSchema.parse(body)

    const created = await prisma.coupon.create({
      data: {
        code: payload.code,
        type: payload.type as any,
        value: payload.value as any,
        minPurchase: payload.minPurchase as any,
        maxDiscount: payload.maxDiscount as any,
        productId: payload.productId || null,
        categoryId: payload.categoryId || null,
        startDate: payload.startDate,
        endDate: payload.endDate,
        usageLimit: payload.usageLimit,
        isActive: payload.isActive ?? true,
      },
    })

    return createApiResponse({ data: created, status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
