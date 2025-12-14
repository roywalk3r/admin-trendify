import { type NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { adminAuthMiddleware } from "@/lib/admin-auth"
import { Decimal } from "@prisma/client/runtime/library"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { sendOrderConfirmationEmail } from "@/lib/email"
import crypto from "crypto"

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const authResponse = await adminAuthMiddleware(request)
    if (authResponse.status !== 200) {
      return authResponse
    }

    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get("id")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")
    const paymentStatus = searchParams.get("paymentStatus")
    const userId = searchParams.get("userId")

    const skip = (page - 1) * limit

    // If specific order ID requested, fetch single order
    if (orderId) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  images: true,
                },
              },
            },
          },
          payment: true,
          shippingAddress: true,
          driver: true,
          coupon: true,
        },
      })

      if (!order) {
        return createApiResponse({ status: 404, error: "Order not found" })
      }

      return createApiResponse({ status: 200, data: order })
    }

    // Build where clause for listing orders
    const where: any = {}
    if (status) where.status = status
    if (paymentStatus) where.paymentStatus = paymentStatus
    if (userId) where.userId = userId

    // Fetch orders with pagination
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  images: true,
                },
              },
            },
          },
          payment: true,
          shippingAddress: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ])

    return createApiResponse({
      status: 200,
      data: {
        orders,
        pagination: { total, page, limit, pages: Math.ceil(total / limit) },
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}


export async function POST(request: NextRequest) {
  try {
    const {
      userId,
      email,
      items,
      shippingAddress,
      addressId,
      paymentMethod,
      total,
      subtotal,
      tax,
      shipping,
      couponCode,
      delivery,
      gatewayFee,
      currencyCode,
    } = await request.json()
    // Validate required fields
    if ((!userId && !email) || !items || !Array.isArray(items) || items.length === 0) {
      return createApiResponse({ status: 400, error: "Missing required fields" })
    }

    // Support guest checkout: if userId is not provided, create or fetch a user by email
    let effectiveUserId = userId as string | undefined
    if (!effectiveUserId && email) {
      const existing = await prisma.user.findFirst({ where: { email: String(email) } })
      if (existing) {
        effectiveUserId = existing.id
      } else {
        const nameFromEmail = String(email).split("@")[0] || "Guest"
        const created = await prisma.user.create({
          data: { email: String(email), name: nameFromEmail, role: "customer", isVerified: true },
        })
        effectiveUserId = created.id
      }
    }

    // If effectiveUserId is a Clerk user id, map it to our internal user.id
    let effectiveInternalUserId = effectiveUserId
    if (effectiveUserId) {
      const local = await prisma.user.findUnique({ where: { clerkId: effectiveUserId } })
      if (local) {
        effectiveInternalUserId = local.id
      } else if (email) {
        // Ensure signed-in users always have a local record for FK integrity
        const nameFromEmail = String(email).split("@")[0] || "Customer"
        const created = await prisma.user.create({
          data: {
            clerkId: effectiveUserId,
            email: String(email),
            name: nameFromEmail,
            role: "customer",
            isVerified: true,
          },
        })
        effectiveInternalUserId = created.id
      }
    }

    if (!effectiveInternalUserId) {
      return createApiResponse({ status: 400, error: "Unable to resolve customer record" })
    }

    // Resolve shipping address: either object provided or fetched via addressId
    let resolvedAddress: any = shippingAddress || null
    if (!resolvedAddress && addressId) {
      const addr = await prisma.address.findFirst({
        where: { id: addressId, userId: effectiveInternalUserId },
      })
      if (addr) {
        resolvedAddress = {
          fullName: addr.fullName,
          street: addr.street,
          city: addr.city,
          state: addr.state,
          zipCode: addr.zipCode,
          country: addr.country,
          phone: addr.phone,
        }
      }
    }

    const isPickup = delivery?.method === "pickup"
    if (!isPickup) {
      if (!resolvedAddress || !resolvedAddress.fullName || !resolvedAddress.street || !resolvedAddress.city) {
        return createApiResponse({ status: 400, error: "Valid shipping address is required" })
      }
    }

    // Validate items and calculate subtotal
    let calculatedSubtotal = 0
    const validatedItems: {
      productId: string
      variantId?: string | null
      quantity: number
      unitPrice: number
      totalPrice: number
      productName: string
      productSku?: string | null
    }[] = []

    // Validate stock availability first
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { id: true, price: true, stock: true, name: true, sku: true, isActive: true, variants: true },
      })

      if (!product) {
        return createApiResponse({ status: 400, error: `Product not found: ${item.productId}` })
      }

      if (!product.isActive) {
        return createApiResponse({ status: 400, error: `Product no longer available: ${product.name}` })
      }

      const variantId = item.variantId ? String(item.variantId) : null
      let unitPrice = Number(product.price as unknown as Decimal)

      if (variantId) {
        const variant = product.variants.find((v: any) => v.id === variantId && !v.deletedAt)
        if (!variant) {
          return createApiResponse({ status: 400, error: `Variant not found for ${product.name}` })
        }
        if (variant.stock < item.quantity) {
          return createApiResponse({ status: 400, error: `Insufficient stock for ${product.name} (${variant.name}). Available: ${variant.stock}` })
        }
        unitPrice = Number(variant.price)
      } else if (product.stock < item.quantity) {
        return createApiResponse({ status: 400, error: `Insufficient stock for ${product.name}. Available: ${product.stock}` })
      }

      const itemTotal = unitPrice * item.quantity
      calculatedSubtotal += itemTotal

      validatedItems.push({
        productId: item.productId,
        variantId,
        quantity: item.quantity,
        unitPrice,
        totalPrice: itemTotal,
        productName: product.name,
        productSku: product.sku ?? null,
      })
    }

    // Validate and apply coupon if provided
    let couponId: string | null = null
    let discount = 0

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode },
        include: { product: true, category: true },
      })

      if (coupon && coupon.isActive) {
        const now = new Date()
        const withinWindow = (!coupon.startDate || now >= coupon.startDate) && (!coupon.endDate || now <= coupon.endDate)
        const withinGlobalUsage = !coupon.usageLimit || coupon.usageCount < coupon.usageLimit

        // Per-user usage enforcement
        let withinUserUsage = true
        if (coupon.perUserLimit) {
          const usedByUser = await prisma.order.count({ where: { userId, couponId: coupon.id } })
          withinUserUsage = usedByUser < coupon.perUserLimit
        }

        if (withinWindow && withinGlobalUsage && withinUserUsage) {
          // Apply coupon discount
          if (coupon.type === "percentage") {
            discount = (calculatedSubtotal * Number(coupon.value)) / 100
            if (coupon.maxDiscount && discount > Number(coupon.maxDiscount)) {
              discount = Number(coupon.maxDiscount)
            }
          } else if (coupon.type === "fixed_amount") {
            discount = Number(coupon.value)
          }

          // Check minimum purchase requirement
          if (coupon.minPurchase && calculatedSubtotal < Number(coupon.minPurchase)) {
            discount = 0
          } else {
            couponId = coupon.id
          }
        }
      }
    }

    const finalTotal = calculatedSubtotal + (tax || 0) + (shipping || 0) - discount

    // Idempotency: compute a signature of this order request and reuse recent unpaid order if present
    const sigPayload = {
      userId: effectiveInternalUserId,
      items: validatedItems.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      shipping: shipping || 0,
      tax: tax || 0,
      couponCode: couponCode || null,
      delivery: delivery || null,
      addressId: addressId || null,
    }
    const signature = crypto.createHash("sha256").update(JSON.stringify(sigPayload)).digest("hex")
    const sigTag = `sig:${signature}`

    // Try to find an existing pending/unpaid order with the same signature in the last 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)
    const existingSame = await prisma.order.findFirst({
      where: {
        userId: String(effectiveInternalUserId),
        status: "pending",
        paymentStatus: "unpaid",
        notes: sigTag,
        createdAt: { gte: tenMinutesAgo },
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        orderItems: { include: { product: { select: { id: true, name: true, images: true, price: true } } } },
        payment: true,
        shippingAddress: true,
      },
    })
    if (existingSame) {
      return createApiResponse({ status: 200, data: { order: existingSame } })
    }

    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
          userId: String(effectiveInternalUserId),
          status: "pending",
          paymentStatus: "unpaid",
          totalAmount: finalTotal,
          subtotal: calculatedSubtotal,
          tax: tax || 0,
          shipping: shipping || 0,
          discount,
          couponId,
          estimatedDelivery: (() => { const d = new Date(); d.setDate(d.getDate() + 3); return d })(),
          // Store signature tag in notes for idempotency lookup
          notes: sigTag,
        },
      })

      // Create order items
      await tx.orderItem.createMany({
        data: validatedItems.map((item) => ({
          orderId: newOrder.id,
          productId: item.productId,
          variantId: item.variantId || null,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          productName: item.productName,
          productSku: item.productSku,
        })),
      })

      // Create shipping address
      if (resolvedAddress) {
        await tx.shippingAddress.create({
          data: {
            orderId: newOrder.id,
            fullName: resolvedAddress.fullName,
            street: resolvedAddress.street,
            city: resolvedAddress.city,
            state: resolvedAddress.state || "",
            zipCode: resolvedAddress.zipCode || "",
            country: resolvedAddress.country || "NG",
            phone: resolvedAddress.phone || "",
          },
        })
      }

      // Create payment record with pending status
      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          method: paymentMethod || "paystack",
          amount: newOrder.totalAmount,
          status: "unpaid",
          currency: currencyCode || "GHS",
          gatewayFee: gatewayFee ? Number(gatewayFee) : null,
        },
      })

      // Reserve stock (decrement)
      for (const item of validatedItems) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          })
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          })
        }
      }

      // Increment coupon usage count if used
      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: {
            usageCount: {
              increment: 1,
            },
          },
        })
      }

      return newOrder
    })

    // Fetch complete order data
    const completeOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                images: true,
              },
            },
          },
        },
        payment: true,
        shippingAddress: true,
      },
    })

    // Send order confirmation email only when paid; for pending/unpaid, send after Paystack verification
    if (completeOrder && completeOrder.paymentStatus === 'paid') {
      try {
        await sendOrderConfirmationEmail(completeOrder.user.email, {
          orderNumber: completeOrder.orderNumber,
          customerName: completeOrder.user.name || completeOrder.user.email.split("@")[0] || "Customer",
          items: completeOrder.orderItems.map((item) => ({
            name: item.productName,
            quantity: item.quantity,
            price: Number(item.unitPrice),
            image: item.product?.images?.[0] || undefined,
          })),
          subtotal: Number(completeOrder.subtotal),
          tax: Number(completeOrder.tax),
          shipping: Number(completeOrder.shipping),
          total: Number(completeOrder.totalAmount),
          estimatedDelivery: completeOrder.estimatedDelivery ? new Date(completeOrder.estimatedDelivery).toLocaleDateString() : undefined,
        })
      } catch (emailError) {
        // Log error but don't fail the order creation
        console.error('Failed to send order confirmation email:', emailError)
      }
    }

    return createApiResponse({ status: 201, data: { order: completeOrder } })
  } catch (error) {
    return handleApiError(error)
  }
}
