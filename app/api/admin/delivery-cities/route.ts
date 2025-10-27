import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { adminAuthMiddleware } from "@/lib/admin-auth"

export async function GET(req: NextRequest) {
  const authRes = await adminAuthMiddleware(req)
  if (authRes.status !== 200) return authRes

  try {
    const url = new URL(req.url)
    const active = url.searchParams.get("active")

    const where: any = {}
    if (active === "true") where.isActive = true
    if (active === "false") where.isActive = false

    const cities = await prisma.deliveryCity.findMany({
      where,
      orderBy: { name: "asc" },
      select: { id: true, name: true, isActive: true },
    })

    return createApiResponse({ status: 200, data: { cities } })
  } catch (error) {
    return handleApiError(error)
  }
}
