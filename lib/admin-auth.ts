import { auth } from "@clerk/nextjs/server"
import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createApiResponse } from "@/lib/api-utils"

/**
 * Check if the current user is an admin
 * @returns Boolean indicating if user is admin
 */
export async function isAdmin() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return false
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    return user?.role === "admin"
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}

/**
 * Middleware to protect admin routes
 * @param req Next.js request
 */
export async function adminAuthMiddleware(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
    }

    return NextResponse.next()
  } catch (error) {
    console.error("Admin auth middleware error:", error)
    return NextResponse.json({ error: "Database connection error" }, { status: 500 })
  }
}

/**
 * Server action to check if current user is admin
 */
export async function checkAdminAccess() {
  const isUserAdmin = await isAdmin()

  if (!isUserAdmin) {
    throw new Error("Admin access required")
  }

  return true
}

/**
 * API route handler to check admin status
 */
export async function GET() {
  try {
    const isUserAdmin = await isAdmin()

    return createApiResponse({
      data: { isAdmin: isUserAdmin },
      status: 200,
    })
  } catch (error) {
    return createApiResponse({
      error: "Failed to check admin status",
      status: 500,
    })
  }
}
