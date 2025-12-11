import { NextRequest } from "next/server"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { withCors, handleOptions } from "@/lib/cors"

export async function OPTIONS(req: NextRequest) {
  return handleOptions(req, { credentials: true })
}

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const origin = new URL(req.url).origin
    const id = params?.id

    const res = await fetch(`${origin}/api/products/${encodeURIComponent(id)}` , {
      method: "GET",
      headers: {
        Authorization: req.headers.get("authorization") || "",
        "x-mobile-proxy": "1",
      },
      cache: "no-store",
      next: { revalidate: 0 },
    })

    const json = await res.json().catch(() => ({}))
    const data = json?.data ?? json

    const out = createApiResponse({ status: res.status, data, error: json?.error })
    return withCors(out, req, { credentials: true })
  } catch (e) {
    const out = handleApiError(e)
    return withCors(out, req, { credentials: true })
  }
}
