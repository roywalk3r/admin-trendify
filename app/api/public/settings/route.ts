export const dynamic = "force-dynamic"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { defaultSettings } from "@/app/api/admin/settings/schema"
import { prismaCache } from "@/lib/prisma-cache"
import { normalizeCacheTags } from "@/lib/prisma-accelerate"

function safeParse(val: any) {
  try {
    return typeof val === 'string' ? JSON.parse(val) : val
  } catch {
    return null
  }
}

export async function GET() {
  try {
    const data: any = {
      flashSale: { ...defaultSettings.flashSale },
    }

    const records = await prisma.settings.findMany({
      cacheStrategy: { ...prismaCache.long(), tags: normalizeCacheTags(["settings", "settings_flashSale"]) },
      where: { key: { in: ["flashSale"] } },
    })
    for (const setting of records) {
      const parsed = safeParse(setting.value)
      if (parsed) data[setting.key] = parsed
    }

    // Only expose safe, public fields
    const { flashSale } = data
    return NextResponse.json({ data: { flashSale } }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to load settings" }, { status: 500 })
  }
}
