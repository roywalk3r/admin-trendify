import prisma from "@/lib/prisma"
import type { NextRequest } from "next/server"
import { z } from "zod"
import { auth } from "@clerk/nextjs/server"
import { createApiResponse, handleApiError, checkRateLimit } from "@/lib/api-utils"

const listQuerySchema = z.object({
  productId: z.string(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  includeMine: z
    .union([z.literal("1"), z.literal("true"), z.literal("0"), z.literal("false")])
    .optional(),
})

const reviewSchema = z.object({
  productId: z.string(),
  rating: z.number().min(1).max(5),
  title: z.string().min(1).max(255).optional(),
  comment: z.string().optional(),
  images: z.array(z.string().url()).optional(),
})

// GET /api/reviews?productId=...&page=1&limit=10&includeMine=1
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const parsed = listQuerySchema.parse({
      productId: searchParams.get("productId"),
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      includeMine: searchParams.get("includeMine") ?? undefined,
    })

    const { page, limit, productId, includeMine } = parsed
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      prisma.review.findMany({
        where: { productId, isApproved: true, deletedAt: null },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
      }),
      prisma.review.count({ where: { productId, isApproved: true, deletedAt: null } }),
    ])

    // Optionally include the current user's review
    let userReview: any = null
    if (includeMine === "1" || includeMine === "true") {
      const { userId } = await auth()
      if (userId) {
        userReview = await prisma.review.findUnique({
          where: { userId_productId: { userId, productId } },
        })
      }
    }

    return createApiResponse({
      data: { items, page, limit, total, userReview },
      status: 200,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/reviews - Create or update user's single review for a product
export async function POST(req: NextRequest) {
  try {
    const rateLimited = checkRateLimit("reviews-post:" + req.headers.get("x-forwarded-for"), 10, 60_000)
    if (rateLimited) {
      return createApiResponse({ error: "Too many requests", status: 429 })
    }

    const { userId } = await auth()
    if (!userId) {
      return createApiResponse({ error: "Unauthorized", status: 401 })
    }

    const body = await req.json()
    const { productId, rating, title, comment, images } = reviewSchema.parse(body)

    // Determine verified purchase: any order item of this product by this user
    const purchased = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: { userId, deletedAt: null },
      },
      select: { id: true },
    })

    const isVerified = !!purchased

    // Upsert by unique (userId, productId)
    const review = await prisma.review.upsert({
      where: { userId_productId: { userId, productId } },
      create: {
        userId,
        productId,
        rating,
        title,
        comment,
        images: images ?? [],
        isVerified,
        // Leave isApproved as default false; moderation can approve later
      },
      update: {
        rating,
        title,
        comment,
        images: images ?? [],
        isVerified, // refresh verification if status changed
      },
    })

    return createApiResponse({ data: review, status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
