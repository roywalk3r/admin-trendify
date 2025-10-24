import { NextResponse } from "next/server"
import { ZodError } from "zod"
import { rateLimit as redisRateLimit } from "./redis"
import { logError, logWarn } from "./logger"
import { captureException } from "@/lib/monitoring/sentry"

type ApiResponse<T = any> = {
  data?: T
  error?: string | string[] | Record<string, string[]> | null
  status?: number
} & Record<string, any>

// Backward-compatible error helper: supports both direct Error handling and (message, status)
export function apiError(errorOrMessage: unknown, status?: number): NextResponse {
  if (typeof errorOrMessage === "string") {
    return createApiResponse({ error: errorOrMessage, status: status ?? 500 })
  }
  return handleApiError(errorOrMessage)
}

export function createApiResponse<T>(response: ApiResponse<T>): NextResponse {
  const { data, error, status, ...rest } = response

  let payload: any = null
  const source = data !== undefined ? data : Object.keys(rest).length ? rest : null

  if (source !== null) {
    try {
      payload = JSON.parse(
        JSON.stringify(source, (_, value) => (typeof value === "bigint" ? Number(value) : value)),
      )
    } catch (err) {
      logError(err, { context: "JSON serialization" })
      payload = null
    }
  }

  return NextResponse.json({ data: payload, error: error || null }, { status })
}

export { createApiResponse as apiResponse }

export function handleApiError(error: unknown): NextResponse {
  // Safely log error - prevent logging failures from crashing the app
  try {
    logError(error, { context: "API Error Handler" })
  } catch (logErr) {
    console.error('[CRITICAL] Logging failed in handleApiError:', logErr)
    console.error('[CRITICAL] Original error:', error)
  }
  
  // Safely capture in Sentry
  try {
    captureException(error, { scope: "api" })
  } catch (sentryErr) {
    console.error('[WARN] Sentry capture failed:', sentryErr)
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const formattedErrors = error.issues.map((err) => `${err.path.join(".")}: ${err.message}`)

    return createApiResponse({
      error: formattedErrors,
      status: 400,
    })
  }

  // Handle Prisma errors
  if (error instanceof Error && error.name === "PrismaClientKnownRequestError") {
    // Handle specific Prisma errors (like unique constraint violations)
    if ("code" in error && error.code === "P2002") {
      return createApiResponse({
        error: "A record with this information already exists.",
        status: 409,
      })
    }
  }

  // Default error response
  return createApiResponse({
    error: "An unexpected error occurred. Please try again later.",
    status: 500,
  })
}

/**
 * Check if request should be rate limited using Redis
 * @param identifier - Unique identifier (e.g., IP address, user ID)
 * @param limit - Maximum requests allowed
 * @param windowInSeconds - Time window in seconds (default 60)
 * @returns Promise<boolean> - true if rate limited, false if allowed
 */
export async function checkRateLimit(
  identifier: string,
  limit: number,
  windowInSeconds: number = 60
): Promise<boolean> {
  try {
    const result = await redisRateLimit(identifier, limit, windowInSeconds)
    
    if (!result.success) {
      logWarn("Rate limit exceeded", { identifier, limit, window: windowInSeconds })
    }
    
    return !result.success // Return true if rate limited
  } catch (error) {
    // If Redis fails, log error but allow the request (fail open)
    logError(error, { context: "Rate limit check failed", identifier })
    return false
  }
}
