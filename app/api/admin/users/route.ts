import type { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { adminAuthMiddleware } from "@/lib/admin-auth"
import { z } from "zod"

// User update validation schema
const userUpdateSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  role: z.enum(["admin", "staff", "customer"]).optional(),
})

export async function GET(req: NextRequest) {
  // Check admin authorization
  const authResponse = await adminAuthMiddleware(req)
  if (authResponse.status !== 200) {
    return authResponse
  }

  try {
    // Get query parameters
    const url = new URL(req.url)
    const search = url.searchParams.get("search")
    const role = url.searchParams.get("role")
    const limit = Number.parseInt(url.searchParams.get("limit") || "50")
    const page = Number.parseInt(url.searchParams.get("page") || "1")

    // Build filter conditions
    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ]
    }

    if (role) {
      where.role = role
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get users with pagination
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              orders: true,
              reviews: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])

    return createApiResponse({
      data: {
        users,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          page,
          limit,
        },
      },
      status: 200,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(req: NextRequest) {
  // Check admin authorization
  const authResponse = await adminAuthMiddleware(req)
  if (authResponse.status !== 200) {
    return authResponse
  }

  try {
    // Parse and validate request body
    const body = await req.json()
    const { id, ...data } = userUpdateSchema.parse(body)

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return createApiResponse({
      data: user,
      status: 200,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(req: NextRequest) {
  // Check admin authorization
  const authResponse = await adminAuthMiddleware(req)
  if (authResponse.status !== 200) {
    return authResponse
  }

  try {
    const url = new URL(req.url)
    const id = url.searchParams.get("id")

    if (!id) {
      return createApiResponse({
        error: "User ID is required",
        status: 400,
      })
    }

    // Delete user
    await prisma.user.delete({
      where: { id },
    })

    return createApiResponse({
      data: { message: "User deleted successfully" },
      status: 200,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
