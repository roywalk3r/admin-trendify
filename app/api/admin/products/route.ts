export const dynamic = "force-dynamic"
import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { z } from "zod"
import { getProductsListCached, invalidateProduct, invalidateProductLists } from "@/lib/data/products"
import { revalidateTag } from "next/cache"
import { requireAdmin } from "@/lib/middleware/admin-auth"

const querySchema = z.object({
  search: z.string().optional().default(""),
  category: z.string().optional().default("all"),
  status: z.enum(["all", "active", "inactive", "draft", "archived", "out_of_stock"]).optional().default("all"),
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
  status: z.enum(["active", "inactive", "draft", "archived", "out_of_stock"]).optional().default("active"),
  variants: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().min(1, "Variant name is required"),
        sku: z.string().optional().nullable(),
        price: z.number().positive("Variant price must be positive"),
        stock: z.number().int().min(0, "Variant stock must be non-negative"),
        attributes: z.record(z.string()).optional().default({}),
      })
    )
    .optional()
    .default([]),
})

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin()
    if (adminCheck.error) return adminCheck.response

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

    // params parsed above; avoid verbose logging in production

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
      where.status = params.status
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

    // Use cached list fetcher (handles count, pagination, formatting)
    const response = await getProductsListCached(params as any)

    // return cached/assembled response

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin()
    if (adminCheck.error) return adminCheck.response

    const body = await request.json()
    const validatedData = productSchema.parse(body)

    const { variants, ...productData } = validatedData

    // Generate slug from name
    const baseSlug = validatedData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    // Ensure slug is unique, but fail fast on collision for admin clarity
    const existingSlug = await prisma.product.findUnique({ where: { slug: baseSlug } })
    if (existingSlug) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 })
    }

    let slug = baseSlug
    let counter = 1
    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    const product = await prisma.product.create({
      data: {
        ...productData,
        slug,
        price: validatedData.price,
        variants: variants.length
          ? {
              create: variants.map((v) => ({
                name: v.name,
                sku: v.sku ?? null,
                price: v.price,
                stock: v.stock,
                attributes: v.attributes ?? {},
              })),
            }
          : undefined,
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

    // Invalidate product caches
    try {
      await invalidateProductLists()
      await invalidateProduct(product.id)
    } catch {}

    return NextResponse.json({ product }, { status: 201 })
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
    const adminCheck = await requireAdmin()
    if (adminCheck.error) return adminCheck.response

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

      // Invalidate caches and revalidate tags
      try {
        await invalidateProductLists()
        for (const pid of productIds) await invalidateProduct(pid)
      } catch {}

      return NextResponse.json({
        message: `${updateResult.count} products updated successfully`,
        updatedCount: updateResult.count,
      })
    }

    // Handle single product update
    const parsed = productSchema.extend({ id: z.string() }).parse(body)
    const { id, variants } = parsed
    const data: any = { ...parsed }
    delete data.id
    delete data.variants

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

    const incomingIds = (variants || []).map((v) => v.id).filter(Boolean) as string[]
    const now = new Date()

    const product = await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          ...data,
          slug,
          price: data.price,
        },
      })

      await tx.productVariant.updateMany({
        where: {
          productId: id,
          deletedAt: null,
          ...(incomingIds.length ? { id: { notIn: incomingIds } } : {}),
        },
        data: { deletedAt: now, isActive: false },
      })

      for (const v of variants || []) {
        const sku = typeof v.sku === "string" && v.sku.trim().length ? v.sku.trim() : null
        const attributes = v.attributes ?? {}

        if (v.id) {
          await tx.productVariant.update({
            where: { id: v.id },
            data: {
              name: v.name,
              sku,
              price: v.price,
              stock: v.stock,
              attributes,
              deletedAt: null,
              isActive: true,
            },
          })
        } else {
          await tx.productVariant.create({
            data: {
              productId: id,
              name: v.name,
              sku,
              price: v.price,
              stock: v.stock,
              attributes,
              isActive: true,
            },
          })
        }
      }

      return tx.product.findUnique({
        where: { id },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          variants: { where: { deletedAt: null }, orderBy: { createdAt: "asc" } },
        },
      })
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Invalidate caches and revalidate tags
    try {
      await invalidateProduct(id)
      await invalidateProductLists()
    } catch {}

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error updating product(s):", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to update product(s)" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin()
    if (adminCheck.error) return adminCheck.response

    const { id } = await request.json()
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Prevent deleting products with order history
    const hasOrders = await prisma.orderItem?.findFirst({
      where: { productId: id },
    })
    if (hasOrders) {
      return NextResponse.json({ error: "Cannot delete product with active orders" }, { status: 400 })
    }

    await prisma.product.delete({ where: { id } })
    try {
      await invalidateProduct(id)
      await invalidateProductLists()
    } catch {}

    return NextResponse.json({ message: "Product deleted" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
