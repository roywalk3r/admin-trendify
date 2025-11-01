import prisma from "@/lib/prisma"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import type { NextRequest } from "next/server"
import { z } from "zod"
import { auth } from "@clerk/nextjs/server"
import { getProductByIdCached, invalidateProduct, invalidateProductLists } from "@/lib/data/products"
import { revalidateTag } from "next/cache"

// Product validation schema
const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  slug: z
      .string()
      .min(2, "Slug must be at least 2 characters")
      .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().positive("Price must be positive"),
  comparePrice: z.number().positive().optional(),
  sku: z.string().optional(),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  categoryId: z.string().min(1, "Category is required"),
  images: z.array(z.string().url()).min(1, "At least one image is required"),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  status: z.enum(["active", "inactive", "draft"]).default("active"),
})

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params

    const product = await getProductByIdCached(id)

    if (!product) {
      return createApiResponse({
        error: "Product not found",
        status: 404,
      })
    }

    return createApiResponse({
      data: product,
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
    const validatedData = productSchema.parse(body)

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    })

    if (!existingProduct) {
      return createApiResponse({
        error: "Product not found",
        status: 404,
      })
    }

    // Check if category exists
    if (validatedData.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: validatedData.categoryId },
      })

      if (!category) {
        return createApiResponse({
          error: "Category not found",
          status: 404,
        })
      }
    }

    // Check if slug or name conflicts with another product
    const conflictingProduct = await prisma.product.findFirst({
      where: {
        OR: [{ name: validatedData.name }, { slug: validatedData.slug }],
        NOT: { id },
        isDeleted: false,
        deletedAt: null,
      },
    })

    if (conflictingProduct) {
      return createApiResponse({
        error: "A different product with this name or slug already exists",
        status: 409,
      })
    }

    // Check if SKU conflicts with another product (if provided)
    if (validatedData.sku) {
      const conflictingSku = await prisma.product.findFirst({
        where: {
          sku: validatedData.sku,
          NOT: { id },
          isDeleted: false,
          deletedAt: null,
        },
      })

      if (conflictingSku) {
        return createApiResponse({
          error: "A different product with this SKU already exists",
          status: 409,
        })
      }
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: validatedData,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            reviews: true,
            orderItems: true,
          },
        },
      },
    })

    // Invalidate caches and revalidate tags
    try {
      await invalidateProduct(id)
      await invalidateProductLists()
      revalidateTag("products")
      revalidateTag(`product:${id}`)
    } catch {}

    return createApiResponse({
      data: updatedProduct,
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

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
    })

    if (!existingProduct) {
      return createApiResponse({
        error: "Product not found",
        status: 404,
      })
    }

    // Check if product has orders
    if (!force && existingProduct._count.orderItems > 0) {
      return createApiResponse({
        error: "Cannot delete product with existing orders",
        status: 409,
      })
    }

    if (force) {
      // Hard delete
      await prisma.product.delete({
        where: { id },
      })
    } else {
      // Soft delete
      await prisma.product.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      })
    }

    // Invalidate caches and revalidate tags
    try {
      await invalidateProduct(id)
      await invalidateProductLists()
      revalidateTag("products")
      revalidateTag(`product:${id}`)
    } catch {}

    return createApiResponse({
      data: { message: "Product deleted successfully", force },
      status: 200,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
