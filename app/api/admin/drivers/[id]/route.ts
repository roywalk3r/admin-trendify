import { NextRequest } from "next/server"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { adminAuthMiddleware } from "@/lib/admin-auth"

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
  email: z.string().email().optional().nullable(),
  licenseNo: z.string().min(3).optional(),
  vehicleType: z.string().min(2).optional(),
  vehicleNo: z.string().min(2).optional(),
  isActive: z.boolean().optional(),
  rating: z.number().min(0).max(5).optional().nullable(),
})

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const driver = await prisma.driver.findUnique({ 
      where: { id: params.id },
      include: {
        _count: { select: { orders: true } }
      }
    })
    if (!driver) return createApiResponse({ status: 404, error: "Not found" })
    return createApiResponse({ data: driver, status: 200 })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const authRes = await adminAuthMiddleware(req)
  if (authRes.status !== 200) return authRes

  try {
    const body = await req.json()
    const payload = updateSchema.parse(body)

    const updated = await prisma.driver.update({
      where: { id: params.id },
      data: payload,
    })

    return createApiResponse({ data: updated, status: 200 })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const authRes = await adminAuthMiddleware(req)
  if (authRes.status !== 200) return authRes

  try {
    await prisma.driver.delete({ where: { id: params.id } })
    return createApiResponse({ data: { ok: true }, status: 200 })
  } catch (error) {
    return handleApiError(error)
  }
}
