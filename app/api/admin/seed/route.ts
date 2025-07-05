import type { NextRequest } from "next/server"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { adminAuthMiddleware } from "@/lib/admin-auth"
import { seedDatabase } from "@/lib/seed-utils"

export async function POST(req: NextRequest) {
  // Check admin authorization
  const authResponse = await adminAuthMiddleware(req)
  if (authResponse.status !== 200) {
    return authResponse
  }

  try {
    const result = await seedDatabase()

    if (result.success) {
      return createApiResponse({
        data: { message: result.message },
        status: 200,
      })
    } else {
      return createApiResponse({
        error: result.message,
        status: 500,
      })
    }
  } catch (error) {
    return handleApiError(error)
  }
}
