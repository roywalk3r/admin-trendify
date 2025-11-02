import { NextRequest } from "next/server"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { withCors, handleOptions } from "@/lib/cors"
import { withRateLimit } from "@/lib/rate-limit"

export async function OPTIONS(req: NextRequest) { return handleOptions(req, { credentials: true }) }

export const GET = withRateLimit(async (req: NextRequest) => { try {
  const url = new URL(req.url); const origin = url.origin; const qs = url.search
  const res = await fetch(`${origin}/api/analytics/search${qs}`, { cache: "no-store" })
  const json = await res.json().catch(() => ({}))
  const out = createApiResponse({ status: res.status, data: json?.data ?? json, error: json?.error })
  return withCors(out, req, { credentials: true })
} catch (e) { const out = handleApiError(e); return withCors(out, req, { credentials: true }) } }, { limit: 120, windowSeconds: 60 })
