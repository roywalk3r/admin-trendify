import { NextRequest } from "next/server"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { withCors, handleOptions } from "@/lib/cors"

export async function OPTIONS(req: NextRequest) { return handleOptions(req, { credentials: true }) }

export async function GET(req: NextRequest) {
  try {
    const origin = new URL(req.url).origin
    const res = await fetch(`${origin}/api/admin/delivery-cities?active=true`, {
      cache: "no-store",
    })
    const json = await res.json().catch(() => ({}))
    const out = createApiResponse({ 
      status: res.status, 
      data: json?.data ?? json, 
      error: json?.error 
    })
    return withCors(out, req, { credentials: true })
  } catch (e) {
    const out = handleApiError(e)
    return withCors(out, req, { credentials: true })
  }
}
