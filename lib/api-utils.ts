import { NextResponse } from "next/server"
import { ZodError } from "zod"

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
      console.error("Serialization Error:", err)
      payload = null
    }
  }

  return NextResponse.json({ data: payload, error: error || null }, { status })
}

export { createApiResponse as apiResponse }

export function handleApiError(error: unknown): NextResponse {
  console.error("API Error:", error)

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

// Rate limiting utility
const rateLimit = new Map<string, { count: number; timestamp: number }>()

export function checkRateLimit(identifier: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const record = rateLimit.get(identifier)

  if (!record) {
    rateLimit.set(identifier, { count: 1, timestamp: now })
    return false
  }

  if (now - record.timestamp > windowMs) {
    // Reset if window has passed
    rateLimit.set(identifier, { count: 1, timestamp: now })
    return false
  }

  if (record.count >= limit) {
    return true // Rate limited
  }

  // Increment count
  rateLimit.set(identifier, {
    count: record.count + 1,
    timestamp: record.timestamp,
  })

  return false
}
