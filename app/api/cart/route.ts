import { auth } from "@clerk/nextjs/server"
import { currentUser } from "@clerk/nextjs/server"
import { z } from "zod"
import type { NextRequest } from "next/server"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import prisma from "@/lib/prisma"

// API contracts remain the same for compatibility with the client
type CartItemPayload = {
  id: string // productId
  name: string
  price: number
  quantity: number
  image: string
  color?: string
  size?: string
  variantId?: string
}

const addItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  // coerce to number to accept string payloads
  price: z.coerce.number().nonnegative(),
  quantity: z.coerce.number().int().positive(),
  image: z.string().min(1),
  color: z.string().optional(),
  size: z.string().optional(),
  variantId: z.string().optional(),
})

const updateQtySchema = z.object({
  id: z.string().min(1),
  quantity: z.coerce.number().int().positive(),
  color: z.string().optional(),
  size: z.string().optional(),
  variantId: z.string().optional(),
})

async function resolveOrCreateLocalUser(clerkUserId: string) {
  // Try to find by clerkId
  let local = await prisma.user.findUnique({ where: { clerkId: clerkUserId } })
  if (local) return local
  // Create minimal local user from Clerk profile if available
  const cu = await currentUser()
  if (!cu) return null
  const email = cu.primaryEmailAddress?.emailAddress || cu.emailAddresses?.[0]?.emailAddress
  if (!email) return null
  const name = (cu.firstName && cu.lastName) ? `${cu.firstName} ${cu.lastName}` : cu.username || email
  local = await prisma.user.create({
    data: {
      clerkId: clerkUserId,
      email,
      name,
      role: "customer",
      isVerified: (cu.primaryEmailAddress as any)?.verification?.status === "verified" || false,
      lastLoginAt: new Date(),
    },
  })
  return local
}

async function getOrCreateCartByClerkId(clerkUserId: string) {
  const local = await resolveOrCreateLocalUser(clerkUserId)
  if (!local) throw new Error("User not found")
  const existing = await prisma.cart.findUnique({ where: { userId: local.id } })
  if (existing) return existing
  return prisma.cart.create({ data: { userId: local.id } })
}

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return createApiResponse({ error: "Unauthorized", status: 401 })
    }

    const local = await resolveOrCreateLocalUser(userId)
    if (!local) return createApiResponse({ error: "User not found", status: 404 })
    const cart = await prisma.cart.findUnique({
      where: { userId: local.id },
      include: { items: true },
    })

  const items = (cart?.items ?? []).map((i) => ({
    id: i.productId,
    variantId: i.variantId ?? undefined,
    name: i.name,
    price: Number(i.unitPrice),
    quantity: i.quantity,
    image: i.image,
    color: i.color ?? undefined,
      size: i.size ?? undefined,
    }))

    return createApiResponse({ data: { items }, status: 200 })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return createApiResponse({ error: "Unauthorized", status: 401 })
    }

  const body = await req.json()
  const item = addItemSchema.parse(body) as CartItemPayload

  // ensure cart exists
  const cart = await getOrCreateCartByClerkId(userId)

  // Resolve product and optional variant
  const product = await prisma.product.findUnique({
    where: { id: item.id, isDeleted: false },
    include: { variants: true },
  })
  if (!product) return createApiResponse({ error: "Product not found", status: 404 })

  const variant = item.variantId
    ? product.variants.find((v) => v.id === item.variantId && !v.deletedAt)
    : null

  if (item.variantId && !variant) {
    return createApiResponse({ error: "Variant not found", status: 404 })
  }

  const unitPrice = variant ? Number(variant.price) : Number(product.price)
  const name = variant ? `${product.name} (${variant.name})` : product.name
  const image = product.images?.[0] || item.image

  const availableStock = variant ? variant.stock : product.stock

  // find existing cart item by composite keys
  const existing = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId: item.id,
      variantId: item.variantId ?? null,
      color: item.color ?? null,
      size: item.size ?? null,
    },
  })

  const existingQty = existing ? existing.quantity : 0
  const newQty = existingQty + item.quantity
  if (availableStock < newQty) {
    return createApiResponse({
      error: `Insufficient stock. Available: ${availableStock}`,
      status: 400,
    })
  }

  // find existing cart item by composite keys
  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: newQty, unitPrice: unitPrice.toString(), name, image },
    })
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: item.id,
        variantId: item.variantId ?? null,
        quantity: item.quantity,
        unitPrice: unitPrice.toString(),
        name,
        image,
        color: item.color ?? null,
        size: item.size ?? null,
      },
    })
  }

  const refreshed = await prisma.cart.findUnique({ where: { id: cart.id }, include: { items: true } })
  const items = (refreshed?.items ?? []).map((i) => ({
    id: i.productId,
    variantId: i.variantId ?? undefined,
    name: i.name,
    price: Number(i.unitPrice),
    quantity: i.quantity,
    image: i.image,
    color: i.color ?? undefined,
      size: i.size ?? undefined,
    }))

    return createApiResponse({ data: { items }, status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return createApiResponse({ error: "Unauthorized", status: 401 })
    }

    const body = await req.json()
    const { id, quantity, color, size, variantId } = updateQtySchema.parse(body)

    const local = await resolveOrCreateLocalUser(userId)
    if (!local) return createApiResponse({ error: "User not found", status: 404 })
    const cart = await prisma.cart.findUnique({ where: { userId: local.id } })
    if (!cart) return createApiResponse({ error: "Cart not found", status: 404 })

    const product = await prisma.product.findUnique({
      where: { id, isDeleted: false },
      include: { variants: true },
    })
    if (!product) return createApiResponse({ error: "Product not found", status: 404 })

    const variant = variantId ? product.variants.find((v) => v.id === variantId && !v.deletedAt) : null
    if (variantId && !variant) {
      return createApiResponse({ error: "Variant not found", status: 404 })
    }
    const unitPrice = variant ? Number(variant.price) : Number(product.price)
    const name = variant ? `${product.name} (${variant.name})` : product.name
    const image = product.images?.[0] || "/placeholder.svg"
    const availableStock = variant ? variant.stock : product.stock

    let item = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId: id, variantId: variantId ?? null, color: color ?? null, size: size ?? null },
    })
    if (!item) {
      if (availableStock < quantity) {
        return createApiResponse({ error: `Insufficient stock. Available: ${availableStock}`, status: 400 })
      }
      item = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: id,
          variantId: variantId ?? null,
          quantity: quantity,
          unitPrice: unitPrice.toString(),
          name,
          image,
          color: color ?? null,
          size: size ?? null,
        },
      })
    } else {
      if (availableStock < quantity) {
        return createApiResponse({ error: `Insufficient stock. Available: ${availableStock}`, status: 400 })
      }
      await prisma.cartItem.update({ where: { id: item.id }, data: { quantity, unitPrice: unitPrice.toString(), name, image } })
    }

    const refreshed = await prisma.cart.findUnique({ where: { id: cart.id }, include: { items: true } })
    const items = (refreshed?.items ?? []).map((i) => ({
      id: i.productId,
      variantId: i.variantId ?? undefined,
      name: i.name,
      price: Number(i.unitPrice),
      quantity: i.quantity,
      image: i.image,
      color: i.color ?? undefined,
      size: i.size ?? undefined,
    }))

    return createApiResponse({ data: { items }, status: 200 })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return createApiResponse({ error: "Unauthorized", status: 401 })
    }

    const url = new URL(req.url)
    const id = url.searchParams.get("id")
    const color = url.searchParams.get("color")
    const size = url.searchParams.get("size")
    const variantId = url.searchParams.get("variantId")
    const clear = url.searchParams.get("clear")

    const cart = await getOrCreateCartByClerkId(userId)

    if (clear === "1") {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
      return createApiResponse({ data: { items: [] }, status: 200 })
    }

    if (!id) {
      return createApiResponse({ error: "id is required", status: 400 })
    }

    // Delete specific variant if color/size provided; otherwise delete by productId
    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
        productId: id,
        variantId: variantId ? variantId : undefined,
        color: color ? color : undefined,
        size: size ? size : undefined,
      },
    })
    const refreshed = await prisma.cart.findUnique({ where: { id: cart.id }, include: { items: true } })
    const items = (refreshed?.items ?? []).map((i) => ({
      id: i.productId,
      variantId: i.variantId ?? undefined,
      name: i.name,
      price: Number(i.unitPrice),
      quantity: i.quantity,
      image: i.image,
      color: i.color ?? undefined,
      size: i.size ?? undefined,
    }))

    return createApiResponse({ data: { items }, status: 200 })
  } catch (error) {
    return handleApiError(error)
  }
}
