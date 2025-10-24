import { NextRequest, NextResponse } from "next/server"
import { rateLimit as redisRateLimit } from "./redis"
import { logWarn } from "./logger"

export type RateLimitOptions = {
  limit: number
  windowSeconds: number
  /** Provide a stable identifier (userId/IP). Defaults to IP. */
  idFromRequest?: (req: NextRequest) => string
}

export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "anonymous"
  )
}

export function withRateLimit<T extends (req: NextRequest, ...args: any[]) => Promise<NextResponse>>(handler: T, opts: RateLimitOptions): T {
  const wrapped = (async (req: NextRequest, ...args: any[]) => {
    const id = (opts.idFromRequest?.(req)) || getClientIp(req)

    const { success, remaining } = await redisRateLimit(`api:${id}`, opts.limit, opts.windowSeconds)

    if (!success) {
      logWarn("Rate limit exceeded", { id, limit: opts.limit, window: opts.windowSeconds })
      return NextResponse.json(
        { data: null, error: "Too many requests" },
        { status: 429, headers: { "Retry-After": String(opts.windowSeconds), "X-RateLimit-Limit": String(opts.limit), "X-RateLimit-Remaining": "0" } }
      )
    }

    const res = await handler(req, ...args)
    try {
      res.headers.set("X-RateLimit-Limit", String(opts.limit))
      res.headers.set("X-RateLimit-Remaining", String(remaining))
    } catch {}
    return res
  }) as T

  return wrapped
}
