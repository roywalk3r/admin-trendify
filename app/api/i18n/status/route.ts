import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { locales } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/dictionaries"

export const runtime = "nodejs"

function flattenDict(obj: any, prefix = ""): string[] {
  const keys: string[] = []
  for (const [k, v] of Object.entries(obj || {})) {
    const key = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === "object") {
      keys.push(...flattenDict(v, key))
    } else if (typeof v === "string") {
      keys.push(key)
    }
  }
  return keys
}

export async function GET() {
  try {
    // Get total keys from English dictionary
    const enDict = await getDictionary("en")
    const totalKeys = flattenDict(enDict)

    // Get translation counts from database
    const counts = await Promise.all(
      locales.map(async (locale) => {
        if (locale === "en") {
          return { locale, count: totalKeys.length, percentage: 100 }
        }
        
        try {
          const count = await prisma.translationCache.count({
            where: { locale },
          })
          return {
            locale,
            count,
            percentage: Math.round((count / totalKeys.length) * 100),
          }
        } catch {
          return { locale, count: 0, percentage: 0 }
        }
      })
    )

    return NextResponse.json({
      totalKeys: totalKeys.length,
      locales: counts,
      status: "ok",
    })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to get status" },
      { status: 500 }
    )
  }
}
