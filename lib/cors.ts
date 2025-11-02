import { NextRequest, NextResponse } from "next/server"

const DEFAULT_ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL,
  process.env.MOBILE_APP_ORIGIN, // e.g., https://localhost, exp://, custom scheme via proxy
  "http://localhost:19006", // Expo web
  "http://localhost:8081", // React Native packager
  "http://localhost:3000",
].filter(Boolean) as string[]

const DEFAULT_HEADERS = [
  "Authorization",
  "Content-Type",
  "X-Requested-With",
  "X-Client-Version",
]

const DEFAULT_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]

export type CorsOptions = {
  origins?: string[]
  methods?: string[]
  headers?: string[]
  credentials?: boolean
  maxAge?: number
}

export function withCors(res: NextResponse, req: NextRequest, opts: CorsOptions = {}): NextResponse {
  const origins = opts.origins || DEFAULT_ALLOWED_ORIGINS
  const methods = (opts.methods || DEFAULT_METHODS).join(", ")
  const headers = (opts.headers || DEFAULT_HEADERS).join(", ")
  const origin = req.headers.get("origin") || "*"

  // If origin is allowed, echo it; otherwise, use '*'
  const allowOrigin = origins.length === 0 || origins.includes(origin) ? origin : "*"

  res.headers.set("Access-Control-Allow-Origin", allowOrigin)
  res.headers.set("Vary", "Origin")
  res.headers.set("Access-Control-Allow-Methods", methods)
  res.headers.set("Access-Control-Allow-Headers", headers)
  res.headers.set("Access-Control-Max-Age", String(opts.maxAge ?? 600))
  if (opts.credentials) {
    res.headers.set("Access-Control-Allow-Credentials", "true")
  }
  return res
}

export function handleOptions(req: NextRequest, opts: CorsOptions = {}): NextResponse {
  const res = new NextResponse(null, { status: 204 })
  return withCors(res, req, opts)
}
