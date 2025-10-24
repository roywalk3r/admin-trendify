import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { createApiResponse } from "@/lib/api-utils"
import { defaultSettings } from "@/app/api/admin/settings/schema"

// Helper to safely parse JSON values stored in DB
function safeJsonParse(value: any) {
  if (!value) return null
  try {
    return typeof value === "string" ? JSON.parse(value) : value
  } catch {
    return null
  }
}

// Public GET endpoint to fetch app settings for storefront
// Does NOT require admin auth and returns non-sensitive settings
export async function GET(_req: NextRequest) {
  // Start with defaults
  const formatted = {
    seo: { ...defaultSettings.seo },
    general: { ...defaultSettings.general },
    social: { ...defaultSettings.social },
    email: { ...defaultSettings.email },
    theme: { ...defaultSettings.theme },
  }

  try {
    const rows = await prisma.settings.findMany()
    for (const row of rows) {
      const key = row.key as keyof typeof formatted
      if (key in formatted) {
        const parsed = safeJsonParse(row.value)
        if (parsed) {
          // Merge to preserve defaults for missing fields
          formatted[key] = { ...formatted[key], ...parsed }
        }
      }
    }
  } catch (e) {
    // Swallow DB errors and serve defaults to avoid breaking storefront
    console.warn("[settings] Failed to read settings from DB, using defaults")
  }

  // Hide any sensitive email fields if present in schema in future
  // e.g. smtpPassword, apiKeys etc.

  return createApiResponse({ data: formatted, status: 200 })
}
