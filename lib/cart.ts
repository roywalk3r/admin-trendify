import { redis } from "./redis"
import { z } from "zod"

// Define cart item schema for validation
const CartItemSchema = z.object({
  id: z.string(),
  productId: z.string(),
  name: z.string(),
  price: z.number().positive(),
  image: z.string(),
  quantity: z.number().int().positive(),
})

export type CartItem = z.infer<typeof CartItemSchema>

const CartSchema = z.object({
  items: z.array(CartItemSchema),
  updatedAt: z.number(),
})

export type Cart = z.infer<typeof CartSchema>

// Cart functions
export async function getCart(userId: string): Promise<Cart> {
  try {
    const cart = await redis.get<Cart>(`cart:${userId}`)

    if (!cart) {
      return { items: [], updatedAt: Date.now() }
    }

    // Validate cart data
    return CartSchema.parse(cart)
  } catch (error) {
    console.error("Error getting cart:", error)
    return { items: [], updatedAt: Date.now() }
  }
}

export async function updateCart(userId: string, cart: Cart): Promise<void> {
  try {
    // Validate cart before saving
    const validatedCart = CartSchema.parse(cart)

    // Set cart with 30-day expiration
    await redis.set(`cart:${userId}`, validatedCart, { ex: 60 * 60 * 24 * 30 })
  } catch (error) {
    console.error("Error updating cart:", error)
  }
}

export async function addToCart(userId: string, item: Omit<CartItem, "id">): Promise<Cart> {
  try {
    const cart = await getCart(userId)

    // Check if item already exists
    const existingItemIndex = cart.items.findIndex((i) => i.productId === item.productId)

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      cart.items[existingItemIndex].quantity += item.quantity
    } else {
      // Add new item with unique ID
      cart.items.push({
        ...item,
        id: crypto.randomUUID(),
      })
    }

    cart.updatedAt = Date.now()

    // Save updated cart
    await updateCart(userId, cart)

    return cart
  } catch (error) {
    console.error("Error adding to cart:", error)
    throw error
  }
}

export async function removeFromCart(userId: string, itemId: string): Promise<Cart> {
  try {
    const cart = await getCart(userId)

    // Remove item
    cart.items = cart.items.filter((item) => item.id !== itemId)
    cart.updatedAt = Date.now()

    // Save updated cart
    await updateCart(userId, cart)

    return cart
  } catch (error) {
    console.error("Error removing from cart:", error)
    throw error
  }
}

export async function updateCartItemQuantity(userId: string, itemId: string, quantity: number): Promise<Cart> {
  try {
    const cart = await getCart(userId)

    // Find and update item
    const itemIndex = cart.items.findIndex((item) => item.id === itemId)

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity
      cart.updatedAt = Date.now()

      // Save updated cart
      await updateCart(userId, cart)
    }

    return cart
  } catch (error) {
    console.error("Error updating cart item quantity:", error)
    throw error
  }
}

export async function clearCart(userId: string): Promise<void> {
  try {
    await redis.del(`cart:${userId}`)
  } catch (error) {
    console.error("Error clearing cart:", error)
    throw error
  }
}
