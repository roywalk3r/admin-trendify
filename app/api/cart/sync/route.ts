import { NextRequest, NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { withRateLimit } from "@/lib/rate-limit"
import { logInfo } from "@/lib/logger"

const cartItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  quantity: z.number().int().positive(),
  color: z.string().optional(),
  size: z.string().optional(),
  image: z.string(),
})

const syncCartSchema = z.object({
  guestCartItems: z.array(cartItemSchema),
})

/**
 * POST /api/cart/sync
 * Merge guest cart with user's authenticated cart when they sign in
 */
export const POST = withRateLimit(async (req: NextRequest) => {
  try {
    const { userId } = await auth()

    if (!userId) {
      return createApiResponse({
        error: "Unauthorized - Please sign in",
        status: 401,
      })
    }

    const body = await req.json()
    const { guestCartItems } = syncCartSchema.parse(body)

    // Resolve internal user id via clerkId and get or create cart
    let local = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!local) {
      const cu = await currentUser()
      if (!cu) return createApiResponse({ error: "Unauthorized - No profile", status: 401 })
      const email = cu.primaryEmailAddress?.emailAddress || cu.emailAddresses?.[0]?.emailAddress
      if (!email) return createApiResponse({ error: "User email missing", status: 400 })
      const name = (cu.firstName && cu.lastName) ? `${cu.firstName} ${cu.lastName}` : cu.username || email
      local = await prisma.user.create({
        data: {
          clerkId: userId,
          email,
          name,
          role: "customer",
          isVerified: (cu.primaryEmailAddress as any)?.verification?.status === "verified" || false,
          lastLoginAt: new Date(),
        },
      })
    }

    // Get or create user's cart
    let userCart = await prisma.cart.findUnique({
      where: { userId: local.id },
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

    if (!userCart) {
      // Create new cart for user
      userCart = await prisma.cart.create({
        data: {
          userId: local.id,
          items: {
            create: [],
          },
        },
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
    }

    // Merge guest cart items with user cart
    const mergedItems: any[] = []
    const itemsToCreate: any[] = []

    for (const guestItem of guestCartItems) {
      // Find if this item already exists in user's cart
      const existingItem = userCart.items.find(
        (item) =>
          item.productId === guestItem.id &&
          item.color === guestItem.color &&
          item.size === guestItem.size
      )

      if (existingItem) {
        // Update quantity (add guest quantity to existing)
        const newQuantity = existingItem.quantity + guestItem.quantity

        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: newQuantity },
        })

        mergedItems.push({
          ...guestItem,
          quantity: newQuantity,
        })

        logInfo("Cart item quantity merged", {
          userId,
          productId: guestItem.id,
          oldQuantity: existingItem.quantity,
          addedQuantity: guestItem.quantity,
          newQuantity,
        })
      } else {
        // Item doesn't exist, add to items to create
        itemsToCreate.push({
          cartId: userCart.id,
          productId: guestItem.id,
          quantity: guestItem.quantity,
          unitPrice: guestItem.price,
          totalPrice: guestItem.price * guestItem.quantity,
          color: guestItem.color,
          size: guestItem.size,
        })

        mergedItems.push(guestItem)
      }
    }

    // Create new items in batch
    if (itemsToCreate.length > 0) {
      await prisma.cartItem.createMany({
        data: itemsToCreate,
      })

      logInfo("Guest cart items added to user cart", {
        userId,
        itemsAdded: itemsToCreate.length,
      })
    }

    // Fetch updated cart to return
    const updatedCart = await prisma.cart.findUnique({
      where: { userId: local.id },
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

    // Format cart items for frontend
    const formattedItems = updatedCart?.items.map((item) => ({
      id: item.productId,
      name: item.product.name,
      price: Number(item.unitPrice),
      quantity: item.quantity,
      color: item.color || undefined,
      size: item.size || undefined,
      image: item.product.images[0] || "",
    })) || []

    logInfo("Cart sync completed", {
      userId,
      guestItemsCount: guestCartItems.length,
      finalItemsCount: formattedItems.length,
    })

    return createApiResponse({
      data: {
        items: formattedItems,
        message: guestCartItems.length > 0 
          ? "Your cart items have been merged successfully" 
          : "Cart synced",
      },
      status: 200,
    })
  } catch (error) {
    return handleApiError(error)
  }
}, { limit: 30, windowSeconds: 60 })

/**
 * GET /api/cart/sync
 * Get user's cart (for syncing after login)
 */
export const GET = withRateLimit(async (req: NextRequest) => {
  try {
    const { userId } = await auth()

    if (!userId) {
      return createApiResponse({
        error: "Unauthorized",
        status: 401,
      })
    }

    // Resolve internal user and fetch cart by internal id
    const local = await prisma.user.findUnique({ where: { clerkId: userId }, select: { id: true } })
    if (!local) return createApiResponse({ data: { items: [] }, status: 200 })
    const userCart = await prisma.cart.findUnique({
      where: { userId: local.id },
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

    if (!userCart) {
      return createApiResponse({
        data: { items: [] },
        status: 200,
      })
    }

    // Format cart items
    const formattedItems = userCart.items.map((item) => ({
      id: item.productId,
      name: item.product.name,
      price: Number(item.unitPrice),
      quantity: item.quantity,
      color: item.color || undefined,
      size: item.size || undefined,
      image: item.product.images[0] || "",
    }))

    return createApiResponse({
      data: { items: formattedItems },
      status: 200,
    })
  } catch (error) {
    return handleApiError(error)
  }
}, { limit: 60, windowSeconds: 60 })
