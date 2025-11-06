import { auth } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import type { NextRequest } from "next/server"
import { z } from "zod"

// Remove the edge runtime config
// export const config = { runtime: 'edge' }

// Validation schema
const wishlistItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
})

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    const url = new URL(req.url)
    const productId = url.searchParams.get("productId")
    const productIdsParam = url.searchParams.get("productIds") // comma-separated list

    // If not signed in, avoid any DB call and return fast defaults
    if (!userId) {
      // For single check: not signed in implies not in wishlist
      if (productId) return createApiResponse({ data: { inWishlist: false }, status: 200 })
      // For bulk check: none are in wishlist
      if (productIdsParam) return createApiResponse({ data: { inWishlistIds: [] as string[] }, status: 200 })
      // For full list: empty items
      return createApiResponse({ data: { items: [] }, status: 200 })
    }

    // Resolve local user (internal id) from Clerk userId
    const localUser = await prisma.user.findUnique({ where: { clerkId: userId }, select: { id: true } })
    if (!localUser) {
      // No local user yet => nothing in wishlist
      if (productId) return createApiResponse({ data: { inWishlist: false }, status: 200 })
      if (productIdsParam) return createApiResponse({ data: { inWishlistIds: [] as string[] }, status: 200 })
      return createApiResponse({ data: { items: [] }, status: 200 })
    }

    // If a specific productId is queried, return lightweight boolean
    if (productId) {
      const wishlist = await prisma.wishlist.findUnique({
        where: { userId: localUser.id },
        include: { items: { select: { productId: true } } },
      })
      const inWishlist = Boolean(wishlist?.items?.some((i) => i.productId === productId))
      return createApiResponse({ data: { inWishlist }, status: 200 })
    }

    // Bulk check: productIds=comma,separated
    if (productIdsParam) {
      const ids = productIdsParam.split(",").map((s) => s.trim()).filter(Boolean)
      if (ids.length === 0) return createApiResponse({ data: { inWishlistIds: [] as string[] }, status: 200 })
      const wishlist = await prisma.wishlist.findUnique({
        where: { userId: localUser.id },
        include: { items: { select: { productId: true } } },
      })
      const set = new Set(wishlist?.items?.map((i) => i.productId) || [])
      const inWishlistIds = ids.filter((id) => set.has(id))
      return createApiResponse({ data: { inWishlistIds }, status: 200 })
    }

    // Get user's wishlist with products
    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: localUser.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                images: true,
                stock: true,
              },
            },
          },
        },
      },
    })

    if (!wishlist) {
      return createApiResponse({
        data: { items: [] },
        status: 200,
      })
    }

    // Serialize Decimal fields in nested product data (e.g., price)
    const safeWishlist = {
      ...wishlist,
      items: wishlist.items.map((it) => ({
        ...it,
        product: it.product
          ? {
              ...it.product,
              price: Number((it.product as any).price),
            }
          : null,
      })),
    }

    return createApiResponse({
      data: safeWishlist,
      status: 200,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return createApiResponse({ error: "Unauthorized", status: 401 })

    // Validate request body
    const body = await req.json()
    const { productId } = wishlistItemSchema.parse(body)

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return createApiResponse({
        error: "Product not found",
        status: 404,
      })
    }

    // Resolve local user and get or create wishlist
    const localUser = await prisma.user.findUnique({ where: { clerkId: userId }, select: { id: true } })
    if (!localUser) return createApiResponse({ error: "User not found", status: 404 })
    let wishlist = await prisma.wishlist.findUnique({ where: { userId: localUser.id }, include: { items: true } })

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({ data: { userId: localUser.id }, include: { items: true } })
    }

    // Check if item already exists in wishlist
    const existingItem = wishlist.items.find((item) => item.productId === productId)

    if (existingItem) {
      return createApiResponse({
        data: { message: "Item already in wishlist" },
        status: 200,
      })
    }

    // Add item to wishlist
    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId,
      },
    })

    return createApiResponse({
      data: wishlistItem,
      status: 201,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return createApiResponse({ error: "Unauthorized", status: 401 })

    const url = new URL(req.url)
    const productId = url.searchParams.get("productId")

    if (!productId) {
      return createApiResponse({
        error: "Product ID is required",
        status: 400,
      })
    }

    // Resolve local user and fetch wishlist id
    const localUser = await prisma.user.findUnique({ where: { clerkId: userId }, select: { id: true } })
    if (!localUser) return createApiResponse({ error: "Wishlist not found", status: 404 })
    const wishlist = await prisma.wishlist.findUnique({ where: { userId: localUser.id }, select: { id: true } })
    if (!wishlist) return createApiResponse({ error: "Wishlist not found", status: 404 })

    // Idempotent delete by wishlistId + productId (race-safe)
    const result = await prisma.wishlistItem.deleteMany({
      where: { wishlistId: wishlist.id, productId },
    })

    return createApiResponse({
      data: { message: result.count > 0 ? "Item removed from wishlist" : "Item was not in wishlist" },
      status: 200,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
