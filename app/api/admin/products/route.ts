import type { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { adminAuthMiddleware } from "@/lib/admin-auth"
import { z } from "zod"

// Product validation schema
const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Product name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().positive("Price must be positive"),
  stock: z.number().int().nonnegative("Stock cannot be negative"),
  categoryId: z.string().min(1, "Category is required"),
  images: z.array(z.string().url("Invalid image URL")).min(1, "At least one image is required"),
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
    const category = url.searchParams.get("category")
    const limit = Number.parseInt(url.searchParams.get("limit") || "50")
    const page = Number.parseInt(url.searchParams.get("page") || "1")

    // Build filter conditions
    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    if (category) {
      where.category_id = category
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    console.log("Fetching products with where:", where)

    // Get products with pagination
    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        _count: {
          select: {
            reviews: true,
            orderItems: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    })

    console.log(`Found ${products.length} products`)

    return createApiResponse({
      data: products,
      status: 200,
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest) {
  // Check admin authorization
  const authResponse = await adminAuthMiddleware(req)
  if (authResponse.status !== 200) {
    return authResponse
  }

  try {
    // Parse and validate request body
    const body = await req.json()
    const validatedData = productSchema.parse(body)

    // Create product
    const product = await prisma.product.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        price: validatedData.price,
        stock: validatedData.stock,
        category: { connect: { id: validatedData.categoryId } },
        images: validatedData.images,
        slug: validatedData.name.toLowerCase().replace(/ /g, "-"), // Generate slug
      },
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

export async function PATCH(req: NextRequest) {
  // Check admin authorization
  const authResponse = await adminAuthMiddleware(req)
  if (authResponse.status !== 200) {
    return authResponse
  }

  try {
    // Parse and validate request body
    const body = await req.json()
    const { id, ...data } = productSchema.parse(body)

    if (!id) {
      return createApiResponse({
        error: "Product ID is required",
        status: 400,
      })
    }

    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock,
        category: { connect: { id: data.categoryId } },
        images: data.images,
      },
      include: { category: true },
    })

    return createApiResponse({
      data: product,
      status: 200,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// export async function DELETE(req: NextRequest) {
//   // Check admin authorization
//   const authResponse = await adminAuthMiddleware(req)
//   if (authResponse.status !== 200) {
//     return authResponse
//   }

//   try {
//     const url = new URL(req.url)
//     const id = url.searchParams.get("id")

//     if (!id) {
//       return createApiResponse({
//         error: "Product ID is required",
//         status: 400,
//       })
//     }

//     // Delete product
//     await prisma.product.delete({
//       where: { id },
//     })

//     return createApiResponse({
//       data: { message: "Product deleted successfully" },
//       status: 200,
//     })
//   } catch (error) {
//     return handleApiError(error)
//   }
// }
