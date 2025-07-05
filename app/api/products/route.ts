import prisma from "@/lib/prisma"
import { createApiResponse, handleApiError, checkRateLimit } from "@/lib/api-utils"
import type { NextRequest } from "next/server"
import { z } from "zod"
import { auth } from "@clerk/nextjs/server"

// Product validation schema
const productSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().positive("Price must be positive"),
  stock: z.number().int().nonnegative("Stock cannot be negative"),
  categoryId: z.string().min(1, "Category is required"),
  images: z.array(z.string().url("Invalid image URL")).min(1, "At least one image is required"),
})

export async function GET(req: NextRequest) {
  try {
    // Get query parameters
    const url = new URL(req.url)
    const category = url.searchParams.get("category")
    const search = url.searchParams.get("search")
    const sort = url.searchParams.get("sort")
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const page = Number.parseInt(url.searchParams.get("page") || "1")

    // Build filter conditions
    const where: any = {}

    if (category) {
      where.category = {
        slug: category,
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    // Build sort options
    let orderBy: any = { createdAt: "desc" }

    if (sort === "price-asc") {
      orderBy = { price: "asc" }
    } else if (sort === "price-desc") {
      orderBy = { price: "desc" }
    } else if (sort === "name-asc") {
      orderBy = { name: "asc" }
    } else if (sort === "name-desc") {
      orderBy = { name: "desc" }
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get products with pagination
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          reviews: {
            select: {
              rating: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    // Calculate average ratings
    const productsWithRatings = products.map((product) => {
      const ratings = product.reviews.map((review) => review.rating)
      const averageRating = ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0

      return {
        ...product,
        averageRating,
        reviewCount: ratings.length,
      }
    })

    return createApiResponse({
      data: {
        products: productsWithRatings,
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

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()

    // Check if user is authenticated and is an admin (you'd need to implement admin check)
    if (!userId) {
      return createApiResponse({
        error: "Unauthorized",
        status: 401,
      })
    }

    // Apply rate limiting
    const clientIp = req.headers.get("x-forwarded-for") || "unknown"
    if (checkRateLimit(`${clientIp}:product-create`, 5, 60000)) {
      return createApiResponse({
        error: "Too many requests. Please try again later.",
        status: 429,
      })
    }

    // Parse and validate request body
    const body = await req.json()
    const validatedData = productSchema.parse(body)

    // Create product
    const product = await prisma.product.create({
      data: validatedData,
      include: { category: true },
    })

    return createApiResponse({
      data: product,
      status: 201,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
