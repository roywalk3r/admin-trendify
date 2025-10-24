import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET /api/shipping/fee?method=pickup|door&city=Accra
// or POST { method, city }
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const method = (url.searchParams.get("method") || "pickup").toLowerCase() as "pickup" | "door"
    const city = url.searchParams.get("city")

    if (method === "pickup") {
      return NextResponse.json({ data: { fee: 0 } })
    }

    const cityName = String(city || "").trim()
    let fee = 0
    if (cityName) {
      const found = await prisma.deliveryCity.findFirst({ where: { name: { equals: cityName, mode: "insensitive" }, isActive: true } })
      fee = found ? Number(found.doorFee) : Number(process.env.DEFAULT_DOOR_FEE || 35)
    } else {
      fee = Number(process.env.DEFAULT_DOOR_FEE || 35)
    }

    return NextResponse.json({ data: { fee } })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const method = String(body?.method || "pickup").toLowerCase() as "pickup" | "door"
    const city = body?.city ? String(body.city) : undefined

    if (method === "pickup") {
      return NextResponse.json({ data: { fee: 0 } })
    }

    const cityName = String(city || "").trim()
    let fee = 0
    if (cityName) {
      const found = await prisma.deliveryCity.findFirst({ where: { name: { equals: cityName, mode: "insensitive" }, isActive: true } })
      fee = found ? Number(found.doorFee) : Number(process.env.DEFAULT_DOOR_FEE || 35)
    } else {
      fee = Number(process.env.DEFAULT_DOOR_FEE || 35)
    }

    return NextResponse.json({ data: { fee } })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal Server Error" }, { status: 500 })
  }
}
