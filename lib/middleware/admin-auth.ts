import { auth, currentUser } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createApiResponse } from "@/lib/api-utils"
import { logWarn } from "@/lib/logger"

/**
 * Middleware to verify admin access
 * Usage in API routes:
 * 
 * export async function GET(req: NextRequest) {
 *   const adminCheck = await requireAdmin()
 *   if (adminCheck.error) return adminCheck.response
 *   
 *   // Admin-only logic here
 * }
 */
export async function requireAdmin() {
  const { userId } = await auth()

  if (!userId) {
    return {
      error: true,
      response: createApiResponse({
        error: "Unauthorized - Please sign in",
        status: 401,
      }),
    }
  }

  // Get user from database
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, role: true, email: true },
  })

  if (!user) {
    return {
      error: true,
      response: createApiResponse({
        error: "User not found in database",
        status: 404,
      }),
    }
  }

  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    logWarn("Unauthorized admin access attempt", {
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    return {
      error: true,
      response: createApiResponse({
        error: "Access denied - Admin privileges required",
        status: 403,
      }),
    }
  }

  return {
    error: false,
    user,
    userId: user.id,
    role: user.role,
  }
}

/**
 * Middleware to verify super admin access
 */
export async function requireSuperAdmin() {
  const { userId } = await auth()

  if (!userId) {
    return {
      error: true,
      response: createApiResponse({
        error: "Unauthorized",
        status: 401,
      }),
    }
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, role: true, email: true },
  })

  if (!user || user.role !== "SUPER_ADMIN") {
    logWarn("Unauthorized super admin access attempt", {
      userId: user?.id,
      email: user?.email,
      role: user?.role,
    })

    return {
      error: true,
      response: createApiResponse({
        error: "Access denied - Super admin privileges required",
        status: 403,
      }),
    }
  }

  return {
    error: false,
    user,
    userId: user.id,
  }
}
