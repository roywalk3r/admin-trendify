import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { createApiResponse, handleApiError, checkRateLimit } from "@/lib/api-utils"
import { logInfo } from "@/lib/logger"
import { nanoid } from "nanoid"

const guestCheckoutSchema = z.object({
  email: z.string().email("Invalid email address"),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
      variantId: z.string().optional(),
    })
  ).min(1, "Cart must have at least one item"),
  shippingAddress: z.object({
    fullName: z.string().min(2, "Full name is required"),
    street: z.string().min(5, "Street address is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    zipCode: z.string().min(5, "ZIP code is required"),
    country: z.string().min(2, "Country is required"),
    phone: z.string().min(10, "Phone number is required"),
  }),
})

export async function POST(req: NextRequest) {
  try {
    // Rate limiting for guest checkout
    const clientIp = req.headers.get("x-forwarded-for") || "unknown"
    const isRateLimited = await checkRateLimit(`${clientIp}:guest-checkout`, 3, 300) // 3 per 5 minutes
    
    if (isRateLimited) {
      return createApiResponse({
        error: "Too many checkout attempts. Please try again later.",
        status: 429,
      })
    }

    const body = await req.json()
    const validatedData = guestCheckoutSchema.parse(body)

    // Fetch product details and validate stock
    const productIds = validatedData.items.map((item) => item.productId)
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
        isDeleted: false,
      },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        sku: true,
        variants: true,
      },
    })

    // Validate all products/variants exist and have sufficient stock
    for (const item of validatedData.items) {
      const product = products.find((p) => p.id === item.productId)
      if (!product) {
        return createApiResponse({
          error: `Product ${item.productId} not found or unavailable`,
          status: 400,
        })
      }
      if (item.variantId) {
        const variant = product.variants.find((v) => v.id === item.variantId && !v.deletedAt)
        if (!variant) {
          return createApiResponse({
            error: `Variant not found for product ${product.name}`,
            status: 400,
          })
        }
        if (variant.stock < item.quantity) {
          return createApiResponse({
            error: `Insufficient stock for ${product.name} (${variant.name}). Available: ${variant.stock}`,
            status: 400,
          })
        }
      } else if (product.stock < item.quantity) {
        return createApiResponse({
          error: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
          status: 400,
        })
      }
    }

    // Calculate order totals
    let subtotal = 0
    const orderItems = validatedData.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!
      const variant = item.variantId
        ? product.variants.find((v) => v.id === item.variantId && !v.deletedAt)
        : null
      const unitPrice = variant ? Number(variant.price) : Number(product.price)
      const itemTotal = unitPrice * item.quantity
      subtotal += itemTotal

      return {
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: unitPrice,
        totalPrice: itemTotal,
        productName: variant ? `${product.name} (${variant.name})` : product.name,
        productSku: variant?.sku || product.sku,
      }
    })

    // TODO: Integrate with tax service for accurate calculation
    const tax = subtotal * 0.1 // Placeholder: 10% tax
    
    // TODO: Integrate with shipping service for accurate calculation
    const shipping = 10 // Placeholder: flat rate
    
    // Payment gateway fee (Paystack: 1.5% + GHS 0.30 or 2.9% for international)
    const GATEWAY_FEE_PERCENTAGE = 0.015 // 1.5%
    const GATEWAY_FIXED_FEE = 0.30
    const beforeGatewayFee = subtotal + tax + shipping
    const gatewayFee = Math.round((beforeGatewayFee * GATEWAY_FEE_PERCENTAGE + GATEWAY_FIXED_FEE) * 100) / 100

    const totalAmount = beforeGatewayFee + gatewayFee

    // Generate unique session ID
    const sessionId = nanoid(32)

    const origin = new URL(req.url).origin

    // Create order (pending/unpaid) using the canonical order creation endpoint
    const createOrderRes = await fetch(`${origin}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: validatedData.email,
        items: validatedData.items,
        shippingAddress: validatedData.shippingAddress,
        paymentMethod: "paystack",
        subtotal,
        tax,
        shipping,
        gatewayFee,
        currencyCode: (process.env.PAYSTACK_CURRENCY || process.env.NEXT_PUBLIC_CURRENCY || "GHS").toString().toUpperCase(),
      }),
      cache: "no-store",
    })

    const createOrderJson = await createOrderRes.json()
    const orderId = createOrderJson?.data?.order?.id || createOrderJson?.data?.id
    if (!createOrderRes.ok || !orderId) {
      return createApiResponse({ status: 502, error: createOrderJson?.error || "Failed to create order" })
    }

    // Initialize Paystack
    const initRes = await fetch(`${origin}/api/payments/paystack/init`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        email: validatedData.email,
        items: orderItems.map((it) => ({
          id: it.productId,
          name: it.productName,
          sku: it.productSku || null,
          price: Number(it.unitPrice),
          quantity: Number(it.quantity),
          image: null,
        })),
      }),
      cache: "no-store",
    })

    const initJson = await initRes.json()
    if (!initRes.ok) {
      return createApiResponse({ status: 502, error: initJson?.error || "Failed to initialize payment" })
    }

    // Create guest session
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    await prisma.guestSession.create({
      data: {
        sessionId,
        email: validatedData.email,
        cartData: {
          items: validatedData.items,
          shippingAddress: validatedData.shippingAddress,
          orderId,
        },
        expiresAt,
      },
    })

    logInfo("Guest checkout initiated", {
      email: validatedData.email,
      sessionId,
      orderId,
      total: totalAmount,
    })

    return createApiResponse({
      data: {
        sessionId,
        orderId,
        summary: {
          subtotal,
          tax,
          shipping,
          gatewayFee,
          total: totalAmount,
        },
        items: orderItems,
        payment: initJson?.data,
        nextStep: "payment",
      },
      status: 201,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// Get guest order status
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const sessionId = url.searchParams.get("sessionId")

    if (!sessionId) {
      return createApiResponse({
        error: "Session ID is required",
        status: 400,
      })
    }

    const session = await prisma.guestSession.findUnique({
      where: { sessionId },
    })

    if (!session) {
      return createApiResponse({
        error: "Session not found or expired",
        status: 404,
      })
    }

    // Check if session is expired
    if (new Date() > session.expiresAt) {
      return createApiResponse({
        error: "Session expired",
        status: 410,
      })
    }

    return createApiResponse({
      data: {
        email: session.email,
        cartData: session.cartData,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
      },
      status: 200,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
