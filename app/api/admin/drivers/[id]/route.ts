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
  serviceCityIds: z.array(z.string()).optional(),
})

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Fetch driver core data first (avoid relying on relation include that may be missing in generated client)
    const driver = await prisma.driver.findUnique({
      where: { id: params.id },
      include: { _count: { select: { orders: true } } },
    })
    if (!driver) return createApiResponse({ status: 404, error: "Not found" })

    // Fetch service areas via join model
    const serviceCities = await prisma.driverServiceCity.findMany({
      where: { driverId: params.id },
      include: { city: true },
    })

    return createApiResponse({ data: { ...driver, serviceCities }, status: 200 })
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

    const { serviceCityIds, ...driverData } = payload as any

    // 1) Validate serviceCityIds first (outside transaction)
    let uniqIds: string[] = []
    if (serviceCityIds) {
      uniqIds = Array.from(new Set(serviceCityIds))
      if (uniqIds.length > 0) {
        const found = await prisma.deliveryCity.findMany({
          where: { id: { in: uniqIds } },
          select: { id: true },
        })
        const foundSet = new Set(found.map((c) => c.id))
        const missing = uniqIds.filter((id) => !foundSet.has(id))
        if (missing.length > 0) {
          throw new Error(`Invalid serviceCityIds: ${missing.join(", ")}`)
        }
      }
    }

    // 2) Build transactional writes as an array of operations
    const ops: any[] = []
    const updateDriverOp = prisma.driver.update({ where: { id: params.id }, data: driverData })
    ops.push(updateDriverOp)

    if (serviceCityIds) {
      // Remove links not in new set
      ops.push(
        prisma.driverServiceCity.deleteMany({ where: { driverId: params.id, cityId: { notIn: uniqIds } } })
      )
      if (uniqIds.length > 0) {
        // Fetch existing within the transaction by adding a findMany as part of the ops is not supported directly;
        // so we fetched existing outside? To keep atomicity, we can recompute creates after update via connectOrCreate alternative.
        // Instead, issue createMany with skipDuplicates to avoid unique conflicts.
        const toCreate = uniqIds.map((cityId) => ({ driverId: params.id, cityId }))
        ops.push(
          prisma.driverServiceCity.createMany({ data: toCreate, skipDuplicates: true as any })
        )
      }
    }

    const [updated] = await prisma.$transaction(ops)

    return createApiResponse({ data: updated, status: 200 })
  } catch (error: any) {
    // Surface validation error for missing/invalid city IDs as 400
    if (typeof error?.message === "string" && error.message.startsWith("Invalid serviceCityIds:")) {
      return createApiResponse({ status: 400, error: error.message })
    }
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
