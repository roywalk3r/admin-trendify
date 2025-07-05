import type { NextRequest } from "next/server"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { isAdmin } from "@/lib/admin-auth"

export async function GET(req: NextRequest) {
  try {
    const isUserAdmin = await isAdmin()

    return createApiResponse({
      data: { isAdmin: isUserAdmin },
      status: 200,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
