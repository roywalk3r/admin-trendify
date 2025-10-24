import { auth } from "@clerk/nextjs/server"
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
})

const updateQtySchema = z.object({
  id: z.string().min(1),
  quantity: z.coerce.number().int().positive(),
  color: z.string().optional(),
  size: z.string().optional(),
})

async function getOrCreateCart(userId: string) {
  const existing = await prisma.cart.findUnique({ where: { userId } })
  if (existing) return existing
  return prisma.cart.create({ data: { userId } })
}

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return createApiResponse({ error: "Unauthorized", status: 401 })
    }

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    })

    const items = (cart?.items ?? []).map((i) => ({
      id: i.productId,
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
    const cart = await getOrCreateCart(userId)

    // find existing cart item by composite keys
    const existing = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: item.id,
        color: item.color ?? null,
        size: item.size ?? null,
      },
    })

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + item.quantity },
      })
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: item.id,
          quantity: item.quantity,
          unitPrice: item.price.toString(),
          name: item.name,
          image: item.image,
          color: item.color,
          size: item.size,
        },
      })
    }

    const refreshed = await prisma.cart.findUnique({ where: { id: cart.id }, include: { items: true } })
    const items = (refreshed?.items ?? []).map((i) => ({
      id: i.productId,
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
    const { id, quantity, color, size } = updateQtySchema.parse(body)

    const cart = await prisma.cart.findUnique({ where: { userId } })
    if (!cart) return createApiResponse({ error: "Cart not found", status: 404 })

    let item = await prisma.cartItem.findFirst({ where: { cartId: cart.id, productId: id, color: color ?? null, size: size ?? null } })
    if (!item) {
      // Create missing cart item using product snapshot so PATCH can recover from desync
      const product = await prisma.product.findUnique({ where: { id } })
      if (!product) return createApiResponse({ error: "Product not found", status: 404 })
      item = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: id,
          quantity: quantity,
          unitPrice: product.price.toString(),
          name: product.name,
          image: (product.images && product.images.length > 0 ? product.images[0] : "/placeholder.svg"),
          color: color ?? null,
          size: size ?? null,
        },
      })
    } else {
      await prisma.cartItem.update({ where: { id: item.id }, data: { quantity } })
    }

    const refreshed = await prisma.cart.findUnique({ where: { id: cart.id }, include: { items: true } })
    const items = (refreshed?.items ?? []).map((i) => ({
      id: i.productId,
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
    const clear = url.searchParams.get("clear")

    const cart = await getOrCreateCart(userId)

    if (clear === "1") {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
      return createApiResponse({ data: { items: [] }, status: 200 })
    }

    if (!id) {
      return createApiResponse({ error: "id is required", status: 400 })
    }

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId: id } })
    const refreshed = await prisma.cart.findUnique({ where: { id: cart.id }, include: { items: true } })
    const items = (refreshed?.items ?? []).map((i) => ({
      id: i.productId,
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
