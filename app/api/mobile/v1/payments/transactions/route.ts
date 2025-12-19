import { NextRequest } from "next/server"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { withCors, handleOptions } from "@/lib/cors"

export async function OPTIONS(req: NextRequest) { return handleOptions(req, { credentials: true }) }

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const origin = url.origin
    const qs = url.search

    // Reuse the web payment listing endpoint (to be added if not present)
    const res = await fetch(`${origin}/api/payments${qs}`, {
      method: "GET",
      headers: { Authorization: req.headers.get("authorization") || "" },
      cache: "no-store",
    })
    const json = await res.json().catch(() => ({}))
    const out = createApiResponse({ status: res.status, data: json?.data ?? json, error: json?.error })
    return withCors(out, req, { credentials: true })
  } catch (e) {
    const out = handleApiError(e)
    return withCors(out, req, { credentials: true })
  }
}
