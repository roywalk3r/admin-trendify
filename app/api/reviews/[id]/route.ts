import prisma from "@/lib/prisma"
import type { NextRequest } from "next/server"
import { z } from "zod"
import { auth } from "@clerk/nextjs/server"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { adminAuthMiddleware } from "@/lib/admin-auth"

const reviewUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  comment: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  images: z.array(z.string().url()).optional(),
})

const adminUpdateSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
})

const helpfulVoteSchema = z.object({
  helpful: z.boolean(),
})

const replySchema = z.object({
  content: z.string().min(1, "Reply content is required"),
})

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params

    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            images: true,
          },
        },
      },
    })

    if (!review) {
      return createApiResponse({
        error: "Review not found",
        status: 404,
      })
    }

    const helpfulCount = review.isHelpful ?? 0
    const notHelpfulCount = 0

    return createApiResponse({
      data: {
        ...review,
        helpfulCount,
        notHelpfulCount,
      },
      status: 200,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return createApiResponse({
        error: "Unauthorized",
        status: 401,
      })
    }

    const { id } = await context.params
    const body = await req.json()

    // Check if this is an admin update
    const isAdminUpdate = body.status || body.moderatorNotes
    if (isAdminUpdate) {
      const authResponse = await adminAuthMiddleware(req)
      if (authResponse.status !== 200) {
        return authResponse
      }

      const validatedData = adminUpdateSchema.parse(body)

      const adminData: any = {}
      if (validatedData.status) {
        if (validatedData.status === "approved") adminData.isApproved = true
        if (validatedData.status === "rejected") adminData.isApproved = false
        // "pending" -> leave isApproved as-is (defaults false)
      }

      const updatedReview = await prisma.review.update({
        where: { id },
        data: adminData,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      return createApiResponse({
        data: updatedReview,
        status: 200,
      })
    }

    // Regular user update
    const validatedData = reviewUpdateSchema.parse(body)

    // Check if user owns this review
    const existingReview = await prisma.review.findUnique({
      where: { id },
      select: { userId: true },
    })

    if (!existingReview || existingReview.userId !== userId) {
      return createApiResponse({
        error: "Review not found or unauthorized",
        status: 404,
      })
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: validatedData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return createApiResponse({
      data: updatedReview,
      status: 200,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return createApiResponse({
        error: "Unauthorized",
        status: 401,
      })
    }

    const { id } = await context.params

    // Check if user owns this review or is admin
    const existingReview = await prisma.review.findUnique({
      where: { id },
      select: { userId: true },
    })

    if (!existingReview) {
      return createApiResponse({
        error: "Review not found",
        status: 404,
      })
    }

    // Allow deletion if user owns the review or is admin
    const isOwner = existingReview.userId === userId
    let isAdmin = false

    if (!isOwner) {
      const authResponse = await adminAuthMiddleware(req)
      isAdmin = authResponse.status === 200
    }

    if (!isOwner && !isAdmin) {
      return createApiResponse({
        error: "Unauthorized",
        status: 403,
      })
    }

    await prisma.review.delete({
      where: { id },
    })

    return createApiResponse({
      data: { message: "Review deleted successfully" },
      status: 200,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
