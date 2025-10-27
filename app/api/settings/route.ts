export const dynamic = "force-dynamic"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { defaultSettings } from "@/app/api/admin/settings/schema"

function safeParse(val: any) {
  try {
    return typeof val === "string" ? JSON.parse(val) : val
  } catch {
    return null
  }
}

// Public GET endpoint to fetch app settings for storefront
// Returns non-sensitive settings only
export async function GET() {
  try {
    const data: any = {
      seo: { ...defaultSettings.seo },
      general: { ...defaultSettings.general },
      social: { ...defaultSettings.social },
      theme: { ...defaultSettings.theme },
      flashSale: { ...defaultSettings.flashSale },
    }

    const rows = await prisma.settings.findMany({
      where: { key: { in: ["seo", "general", "social", "theme", "flashSale"] } },
    })
    for (const row of rows) {
      const parsed = safeParse(row.value)
      if (parsed) data[row.key] = { ...data[row.key], ...parsed }
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to load settings" }, { status: 500 })
  }
}
