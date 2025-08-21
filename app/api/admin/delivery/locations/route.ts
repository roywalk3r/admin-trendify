import type { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { adminAuthMiddleware } from "@/lib/admin-auth"

export async function POST(req: NextRequest) {
  const auth = await adminAuthMiddleware(req)
  if (auth.status !== 200) return auth
  const body = await req.json().catch(() => ({}))
  const cityId = String(body?.cityId || "").trim()
  const name = String(body?.name || "").trim()
  const address = body?.address ? String(body.address) : null
  if (!cityId || !name) return Response.json({ error: "cityId and name are required" }, { status: 400 })
  const location = await prisma.pickupLocation.create({ data: { cityId, name, address: address || undefined } })
  return Response.json({ data: { id: location.id, cityId: location.cityId, name: location.name, address: location.address, isActive: location.isActive } })
}
