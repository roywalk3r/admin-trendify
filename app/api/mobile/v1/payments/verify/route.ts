import { NextRequest } from "next/server"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { withCors, handleOptions } from "@/lib/cors"
import { withRateLimit } from "@/lib/rate-limit"

export async function OPTIONS(req: NextRequest) {
  return handleOptions(req, { credentials: true })
}

export const POST = withRateLimit(async (req: NextRequest) => {
  try {
    const origin = new URL(req.url).origin
    const body = await req.json().catch(() => ({}))

    const res = await fetch(`${origin}/api/payments/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: req.headers.get("authorization") || "",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    })

    const json = await res.json().catch(() => ({}))
    const out = createApiResponse({ status: res.status, data: json?.data ?? json, error: json?.error })
    return withCors(out, req, { credentials: true })
  } catch (e) {
    const out = handleApiError(e)
    return withCors(out, req, { credentials: true })
  }
}, { limit: 10, windowSeconds: 60 })
