import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const cities = await prisma.deliveryCity.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: { pickupLocations: { where: { isActive: true }, orderBy: { name: "asc" } } },
    })
    const data = cities.map((c) => ({
      id: c.id,
      name: c.name,
      doorFee: Number(c.doorFee),
      locations: c.pickupLocations.map((p) => ({ id: p.id, name: p.name, address: p.address || null })),
    }))
    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: "Failed to load shipping options" }, { status: 500 })
  }
}
