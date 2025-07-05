import { NextResponse } from "next/server"
import { ZodError } from "zod"

type ApiResponse<T> = {
  data?: T
  error?: string | string[] | Record<string, string[]> | null
  status?: number
}

export function createApiResponse<T>(response: ApiResponse<T>): NextResponse {
  const { data, error, status } = response

  let serializeData: T | null = null

  if (data !== undefined) {
    try {
      serializeData = JSON.parse(
        JSON.stringify(data, (_, value) => (typeof value === "bigint" ? Number(value) : value)),
      )
    } catch (err) {
      console.error("Serialization Error:", err)
      serializeData = null
    }
  }

  return NextResponse.json({ data: serializeData, error: error || null }, { status })
}

export function handleApiError(error: unknown): NextResponse {
  console.error("API Error:", error)

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const formattedErrors = error.errors.map((err) => `${err.path.join(".")}: ${err.message}`)

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
