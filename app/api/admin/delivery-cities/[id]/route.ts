import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { adminAuthMiddleware } from "@/lib/admin-auth"
import { z } from "zod"

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  doorFee: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const authRes = await adminAuthMiddleware(req)
  if (authRes.status !== 200) return authRes

  try {
    const body = await req.json()
    const data = updateSchema.parse(body)

    const updated = await prisma.deliveryCity.update({
      where: { id: params.id },
      data: {
        name: data.name,
        doorFee: data.doorFee,
        isActive: data.isActive,
      },
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
    await prisma.deliveryCity.delete({ where: { id: params.id } })
    return createApiResponse({ status: 204 })
  } catch (error) {
    return handleApiError(error)
  }
}
