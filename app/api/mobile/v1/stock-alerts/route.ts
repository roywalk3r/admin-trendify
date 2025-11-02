import { NextRequest } from "next/server"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { withCors, handleOptions } from "@/lib/cors"

export async function OPTIONS(req: NextRequest) { return handleOptions(req, { credentials: true }) }

export async function POST(req: NextRequest) { try {
  const origin = new URL(req.url).origin
  const body = await req.json().catch(() => ({}))
  const res = await fetch(`${origin}/api/stock-alerts`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), cache: "no-store" })
  const json = await res.json().catch(() => ({}))
  const out = createApiResponse({ status: res.status, data: json?.data ?? json, error: json?.error })
  return withCors(out, req, { credentials: true })
} catch (e) { const out = handleApiError(e); return withCors(out, req, { credentials: true }) } }
