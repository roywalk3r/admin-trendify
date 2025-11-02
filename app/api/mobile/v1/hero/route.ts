import { NextRequest } from "next/server"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { withCors, handleOptions } from "@/lib/cors"

export async function OPTIONS(req: NextRequest) { return handleOptions(req, { credentials: true }) }

export async function GET(req: NextRequest) { try {
  const origin = new URL(req.url).origin
  // Use the public hero endpoint which returns only active slides with the
  // same structure the frontend component expects
  const res = await fetch(`${origin}/api/hero`, { cache: "no-store" })
  const json = await res.json().catch(() => ({}))
  const out = createApiResponse({ status: res.status, data: json?.data ?? json, error: json?.error })
  return withCors(out, req, { credentials: true })
} catch (e) { const out = handleApiError(e); return withCors(out, req, { credentials: true }) } }
