export const dynamic = "force-dynamic"
import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { defaultSettings } from "@/app/api/admin/settings/schema"
import { createApiResponse } from "@/lib/api-utils"

function safeParse(val: any) {
  try {
    return typeof val === "string" ? JSON.parse(val) : val
  } catch {
    return null
  }
}

function toNum(n: any): number {
  if (n == null) return 0
  if (typeof n === "number") return n
  if (typeof n === "string") return Number(n)
  if (typeof (n as any).toNumber === "function") return (n as any).toNumber()
  try { return Number(n) } catch { return 0 }
}

export async function GET(req: NextRequest) {
  try {
    // Load flash sale settings (public)
    const record = await prisma.settings.findUnique({ where: { key: "flashSale" } })
    const flash = record ? safeParse(record.value) : defaultSettings.flashSale

    if (!flash?.enabled) {
      return createApiResponse({ data: { items: [], discountPercent: 0, endsAt: null }, status: 200 })
    }

    const search = new URL(req.url).searchParams.get("search")?.trim()

    // Build product filter
    const ids: string[] = Array.isArray(flash.productIds) ? flash.productIds : []
    const where: any = { isActive: true, isDeleted: false }
    if (ids.length > 0) where.id = { in: ids }
    if (search) where.name = { contains: search, mode: "insensitive" }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 48,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        comparePrice: true,
        images: true,
        status: true,
      },
    })

    const discount = Number(flash.discountPercent ?? 0)
    const items = products.map((p) => {
      const price = toNum(p.price)
      const discounted = Math.max(0, Math.round(price * (1 - discount / 100) * 100) / 100)
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        image: p.images?.[0] ?? null,
        originalPrice: price,
        price: discounted,
        discountPercent: discount,
      }
    })

    return createApiResponse({
      data: {
        items,
        discountPercent: discount,
        endsAt: flash.endsAt ?? null,
      },
      status: 200,
    })
  } catch (e: any) {
    return createApiResponse({ error: e?.message || "Failed to load sale items", status: 500 })
  }
}
