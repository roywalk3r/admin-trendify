import type { NextRequest } from "next/server"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { adminAuthMiddleware } from "@/lib/admin-auth"
import { testDatabaseConnection } from "@/lib/db-test"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    // Check admin authorization
    const authResponse = await adminAuthMiddleware(req)
    if (authResponse.status !== 200) {
      return authResponse
    }

    // Test database connection
    const dbConnected = await testDatabaseConnection()

    // Get database info
    let dbInfo = null
    let settingsCount = 0
    let settingsData = null

    if (dbConnected) {
      try {
        // Get database version
        const versionResult = await prisma.$queryRaw`SELECT version()`
        dbInfo = versionResult

        // Count settings
        const count = await prisma.settings.count()
        settingsCount = count

        // Get settings data (limited)
        if (count > 0) {
          const settings = await prisma.settings.findMany({
            select: {
              type: true,
              createdAt: true,
              updatedAt: true,
            },
          })
          settingsData = settings
        }
      } catch (e) {
        console.error("Error getting database info:", e)
      }
    }

    return createApiResponse({
      data: {
        dbConnected,
        dbInfo,
        settingsCount,
        settingsData,
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
      },
      status: 200,
    })
  } catch (error) {
    console.error("Error in debug endpoint:", error)
    return handleApiError(error)
  }
}
