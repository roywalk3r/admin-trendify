import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { withCors, handleOptions } from "@/lib/cors"
import { withRateLimit } from "@/lib/rate-limit"

export async function OPTIONS(req: NextRequest) {
  return handleOptions(req, { credentials: true })
}

export const GET = withRateLimit(async (req: NextRequest) => {
  try {
    const { userId } = await auth()
    if (!userId) {
      const res = createApiResponse({ status: 401, error: "Unauthorized" })
      return withCors(res, req, { credentials: true })
    }

    // Reuse existing profile endpoint to hydrate session details
    const origin = new URL(req.url).origin
    const res = await fetch(`${origin}/api/profile`, {
      headers: {
        // Forward auth header if present (Clerk JWT)
        Authorization: req.headers.get("authorization") || "",
      },
      cache: "no-store",
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      const out = createApiResponse({ status: res.status, error: body?.error || "Failed to load session" })
      return withCors(out, req, { credentials: true })
    }

    const body = await res.json()
    const out = createApiResponse({ status: 200, data: { user: body?.data?.user, orders: body?.data?.orders  || [] } })
    return withCors(out, req, { credentials: true })
  } catch (e) {
    const out = handleApiError(e)
    return withCors(out, req, { credentials: true })
  }
}, { limit: 60, windowSeconds: 60 })
