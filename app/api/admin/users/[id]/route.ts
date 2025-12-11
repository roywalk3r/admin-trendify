import prisma from "@/lib/prisma"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import type { NextRequest } from "next/server"
import { z } from "zod"
import { auth } from "@clerk/nextjs/server"

// User update validation schema
const userUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
  role: z.enum(["staff", "customer", "admin"]).optional(),
  isActive: z.boolean().optional(),
})

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()

    // Check if user is authenticated
    if (!userId) {
      return createApiResponse({
        error: "Unauthorized",
        status: 401,
      })
    }

    const { id } = await context.params

    // Fetch user with related data
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        orders: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
        _count: {
          select: {
            orders: true,
            reviews: true,
           },
        },
      },
    })

    if (!user) {
      return createApiResponse({
        error: "User not found",
        status: 404,
      })
    }

    return createApiResponse({
      data: user,
      status: 200,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()

    // Check if user is authenticated
    if (!userId) {
      return createApiResponse({
        error: "Unauthorized",
        status: 401,
      })
    }

    const { id } = await context.params

    // Parse and validate request body
    const body = await req.json()
    const validatedData = userUpdateSchema.parse(body)

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      return createApiResponse({
        error: "User not found",
        status: 404,
      })
    }

    // Check if email conflicts with another user
    if (validatedData.email) {
      const conflictingUser = await prisma.user.findFirst({
        where: {
          email: validatedData.email,
          NOT: { id },
        },
      })

      if (conflictingUser) {
        return createApiResponse({
          error: "A user with this email already exists",
          status: 409,
        })
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
      include: {
        _count: {
          select: {
            orders: true,
            reviews: true,
           },
        },
      },
    })

    return createApiResponse({
      data: updatedUser,
      status: 200,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()

    // Check if user is authenticated
    if (!userId) {
      return createApiResponse({
        error: "Unauthorized",
        status: 401,
      })
    }

    const { id } = await context.params
    const url = new URL(req.url)
    const force = url.searchParams.get("force") === "true"

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orders: true,
            reviews: true,
          },
        },
      },
    })

    if (!existingUser) {
      return createApiResponse({
        error: "User not found",
        status: 404,
      })
    }

    // Prevent self-deletion
    if (existingUser.id === userId) {
      return createApiResponse({
        error: "Cannot delete your own account",
        status: 409,
      })
    }

    // Check if user has orders or reviews
    if (!force && (existingUser._count.orders > 0 || existingUser._count.reviews > 0)) {
      return createApiResponse({
        error: "Cannot delete user with existing orders or reviews. Use force=true to override.",
        status: 409,
      })
    }

    if (force) {
      // Hard delete with cascade
      await prisma.$transaction([
        prisma.review.deleteMany({
          where: { userId: id },
        }),
        prisma.wishlistItem.deleteMany({
          where: { id: id },
        }),
        prisma.orderItem.deleteMany({
          where: {
            order: {
              userId: id,
            },
          },
        }),
        prisma.order.deleteMany({
          where: { userId: id },
        }),
        prisma.user.delete({
          where: { id },
        }),
      ])
    } else {
      // Soft delete
      await prisma.user.update({
        where: { id },
        data: {
          isActive: false,
          updatedAt: new Date(),
        },
      })
    }

    return createApiResponse({
      data: { message: "User deleted successfully", force },
      status: 200,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
