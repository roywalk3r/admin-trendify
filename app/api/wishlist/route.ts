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

    if (!userId) {
      return createApiResponse({
        error: "Unauthorized",
        status: 401,
      })
    }

    // Get user's wishlist with products
    const wishlist = await prisma.wishlist.findUnique({
      where: { userId },
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

    return createApiResponse({
      data: wishlist,
      status: 200,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return createApiResponse({
        error: "Unauthorized",
        status: 401,
      })
    }

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

    // Get or create wishlist
    let wishlist = await prisma.wishlist.findUnique({
      where: { userId },
      include: { items: true },
    })

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId },
        include: { items: true },
      })
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

    if (!userId) {
      return createApiResponse({
        error: "Unauthorized",
        status: 401,
      })
    }

    const url = new URL(req.url)
    const productId = url.searchParams.get("productId")

    if (!productId) {
      return createApiResponse({
        error: "Product ID is required",
        status: 400,
      })
    }

    // Get wishlist
    const wishlist = await prisma.wishlist.findUnique({
      where: { userId },
      include: { items: true },
    })

    if (!wishlist) {
      return createApiResponse({
        error: "Wishlist not found",
        status: 404,
      })
    }

    // Find item in wishlist
    const item = wishlist.items.find((item) => item.productId === productId)

    if (!item) {
      return createApiResponse({
        error: "Item not found in wishlist",
        status: 404,
      })
    }

    // Remove item from wishlist
    await prisma.wishlistItem.delete({
      where: { id: item.id },
    })

    return createApiResponse({
      data: { message: "Item removed from wishlist" },
      status: 200,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
