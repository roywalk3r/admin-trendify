import { NextRequest, NextResponse } from "next/server"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { withCors, handleOptions } from "@/lib/cors"

export async function OPTIONS(req: NextRequest) {
  return handleOptions(req, { credentials: true })
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const origin = url.origin
    const qs = url.search

    const res = await fetch(`${origin}/api/products${qs}`, {
      method: "GET",
      headers: {
        Authorization: req.headers.get("authorization") || "",
      },
      cache: "no-store",
      next: { revalidate: 0 },
    })

    const json = await res.json().catch(() => ({}))

    // If the upstream already returns { data, error }, pass through into our envelope
    const data = json?.data ?? json
    const out = createApiResponse({ status: res.status, data, error: json?.error })
    return withCors(out, req, { credentials: true })
  } catch (e) {
    const out = handleApiError(e)
    return withCors(out, req, { credentials: true })
  }
}
