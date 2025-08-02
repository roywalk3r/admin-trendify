import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { z } from "zod"

const querySchema = z.object({
  search: z.string().optional().default(""),
  category: z.string().optional().default("all"),
  status: z.enum(["all", "active", "inactive"]).optional().default("all"),
  featured: z.enum(["all", "true", "false"]).optional().default("all"),
  sortBy: z.enum(["name", "price", "stock", "createdAt", "category"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
})

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().positive("Price must be positive"),
  stock: z.number().int().min(0, "Stock must be non-negative"),
  categoryId: z.string().min(1, "Category is required"),
  images: z.array(z.string()).optional().default([]),
  isActive: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
  status: z.enum(["active", "inactive", "draft"]).optional().default("active"),
})

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const params = querySchema.parse({
      search: searchParams.get("search") || "",
      category: searchParams.get("category") || "all",
      status: searchParams.get("status") || "all",
      featured: searchParams.get("featured") || "all",
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: searchParams.get("sortOrder") || "desc",
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "20",
    })

    console.log("Fetching products with params:", params)

    // Build where clause
    const where: any = {
      isDeleted: false, // Only show non-deleted products
    }

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { description: { contains: params.search, mode: "insensitive" } },
      ]
    }

    if (params.category !== "all") {
      where.categoryId = params.category
    }

    if (params.status !== "all") {
      where.isActive = params.status === "active"
    }

    if (params.featured !== "all") {
      where.isFeatured = params.featured === "true"
    }

    // Build orderBy clause
    const orderBy: any = {}
    if (params.sortBy === "category") {
      orderBy.category = { name: params.sortOrder }
    } else {
      orderBy[params.sortBy] = params.sortOrder
    }

    // Get total count
    const totalCount = await prisma.product.count({ where })

    // Get products with pagination
    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            reviews: true,
            orderItems: true,
          },
        },
      },
      orderBy,
      skip: params.page !== undefined && params.limit !== undefined ? (params.page - 1) * params.limit : 0,
      take: params.limit !== undefined ? params.limit : 10,
    })

    const totalPages = Math.ceil(totalCount / (params.limit !== undefined ? params.limit : 10))

    const response = {
      products: products.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        stock: product.stock,
        categoryId: product.categoryId,
        category: product.category,
        images: product.images,
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        status: product.status,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        reviewCount: product._count.reviews,
        orderCount: product._count.orderItems,
      })),
      pagination: {
        page: params.page,
        limit: params.limit,
        totalCount,
        totalPages,
        hasNextPage: params.page !== undefined && params.page < totalPages,
        hasPrevPage: params.page !== undefined && params.page > 1,
      },
      filters: params,
    }

    console.log("API Response:", { products: response.products.length, totalCount })

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = productSchema.parse(body)

    // Generate slug from name
    const baseSlug = validatedData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")

    // Ensure slug is unique
    let slug = baseSlug
    let counter = 1
    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    const product = await prisma.product.create({
      data: {
        ...validatedData,
        slug,
        price: validatedData.price,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Handle bulk operations
    if (body.action && body.productIds) {
      const { action, productIds } = body

      if (!Array.isArray(productIds) || productIds.length === 0) {
        return NextResponse.json({ error: "Product IDs are required" }, { status: 400 })
      }

      let updateData: any = {}

      switch (action) {
        case "activate":
          updateData = { isActive: true, status: "active" }
          break
        case "deactivate":
          updateData = { isActive: false, status: "inactive" }
          break
        case "feature":
          updateData = { isFeatured: true }
          break
        case "unfeature":
          updateData = { isFeatured: false }
          break
        case "delete":
          const deleteResult = await prisma.product.updateMany({
            where: {
              id: {
                in: productIds,
              },
            },
            data: {
              isDeleted: true,
              deletedAt: new Date(),
            },
          })
          return NextResponse.json({
            message: `${deleteResult.count} products deleted successfully`,
            deletedCount: deleteResult.count,
          })
        default:
          return NextResponse.json({ error: "Invalid action" }, { status: 400 })
      }

      const updateResult = await prisma.product.updateMany({
        where: {
          id: {
            in: productIds,
          },
        },
        data: updateData,
      })

      return NextResponse.json({
        message: `${updateResult.count} products updated successfully`,
        updatedCount: updateResult.count,
      })
    }

    // Handle single product update
    const { id, ...data } = productSchema.extend({ id: z.string() }).parse(body)

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    })

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Update slug if name changed
    let slug = existingProduct.slug
    if (data.name !== existingProduct.name) {
      const baseSlug = data.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")

      slug = baseSlug
      let counter = 1
      while (
          await prisma.product.findFirst({
            where: {
              slug,
              id: { not: id },
            },
          })
          ) {
        slug = `${baseSlug}-${counter}`
        counter++
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        slug,
        price: data.price,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error updating product(s):", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to update product(s)" }, { status: 500 })
  }
}
