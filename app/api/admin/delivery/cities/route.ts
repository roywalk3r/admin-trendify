import type { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { adminAuthMiddleware } from "@/lib/admin-auth"

export async function GET(req: NextRequest) {
  // Admin-protected list of cities with locations
  const auth = await adminAuthMiddleware(req)
  if (auth.status !== 200) return auth
  const cities = await prisma.deliveryCity.findMany({
    orderBy: { name: "asc" },
    include: { pickupLocations: { orderBy: { name: "asc" } } },
  })
  return Response.json({ data: cities.map(c => ({
    id: c.id,
    name: c.name,
    doorFee: Number(c.doorFee),
    isActive: c.isActive,
    locations: c.pickupLocations.map(p => ({ id: p.id, name: p.name, address: p.address, isActive: p.isActive })),
  })) })
}

export async function POST(req: NextRequest) {
  const auth = await adminAuthMiddleware(req)
  if (auth.status !== 200) return auth
  const body = await req.json().catch(() => ({}))
  const name = String(body?.name || "").trim()
  const doorFee = Number(body?.doorFee ?? 0)
  if (!name || !Number.isFinite(doorFee)) return Response.json({ error: "Invalid name or doorFee" }, { status: 400 })
  const city = await prisma.deliveryCity.create({ data: { name, doorFee } })
  return Response.json({ data: { id: city.id, name: city.name, doorFee: Number(city.doorFee), isActive: city.isActive } })
}
