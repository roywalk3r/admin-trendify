import { NextRequest } from "next/server"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { adminAuthMiddleware } from "@/lib/admin-auth"

const updateSchema = z.object({
  code: z.string().min(2).max(20).optional(),
  type: z.enum(["percentage", "fixed_amount"]).optional(),
  value: z.number().positive().optional(),
  minPurchase: z.number().positive().optional().nullable(),
  maxDiscount: z.number().positive().optional().nullable(),
  productId: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  usageLimit: z.number().int().positive().optional().nullable(),
  isActive: z.boolean().optional(),
})

export async function GET(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const coupon = await prisma.coupon.findUnique({ 
      where: { id: params.id },
      include: {
        product: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
      }
    })
    if (!coupon) return createApiResponse({ status: 404, error: "Not found" })
    return createApiResponse({ data: coupon, status: 200 })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const authRes = await adminAuthMiddleware(req)
  if (authRes.status !== 200) return authRes

  try {
    const body = await req.json()
    const payload = updateSchema.parse(body)

    const updated = await prisma.coupon.update({
      where: { id: params.id },
      data: {
        ...(payload.code != null ? { code: payload.code } : {}),
        ...(payload.type != null ? { type: payload.type as any } : {}),
        ...(payload.value != null ? { value: payload.value as any } : {}),
        minPurchase: (payload.minPurchase as any) ?? undefined,
        maxDiscount: (payload.maxDiscount as any) ?? undefined,
        productId: payload.productId !== undefined ? (payload.productId || null) : undefined,
        categoryId: payload.categoryId !== undefined ? (payload.categoryId || null) : undefined,
        ...(payload.startDate ? { startDate: new Date(payload.startDate) } : {}),
        ...(payload.endDate ? { endDate: new Date(payload.endDate) } : {}),
        usageLimit: payload.usageLimit ?? undefined,
        ...(payload.isActive != null ? { isActive: payload.isActive } : {}),
      },
    })

    return createApiResponse({ data: updated, status: 200 })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const authRes = await adminAuthMiddleware(req)
  if (authRes.status !== 200) return authRes

  try {
    await prisma.coupon.delete({ where: { id: params.id } })
    return createApiResponse({ data: { ok: true }, status: 200 })
  } catch (error) {
    return handleApiError(error)
  }
}
