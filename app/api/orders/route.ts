import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { adminAuthMiddleware } from "@/lib/admin-auth"
import { Decimal } from "@prisma/client/runtime/library"

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
        return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 })
      }

      return NextResponse.json({ success: true, order })
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

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch orders" }, { status: 500 })
  }
}


export async function POST(request: NextRequest) {
  try {
    const { userId, items, shippingAddress, addressId, paymentMethod, total, subtotal, tax, shipping, couponCode } = await request.json()

    // Validate required fields
    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // Resolve shipping address: either object provided or fetched via addressId
    let resolvedAddress: any = shippingAddress || null
    if (!resolvedAddress && addressId) {
      const addr = await prisma.address.findFirst({
        where: { id: addressId, userId },
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

    if (!resolvedAddress || !resolvedAddress.fullName || !resolvedAddress.street || !resolvedAddress.city) {
      return NextResponse.json({ success: false, message: "Valid shipping address is required" }, { status: 400 })
    }

    // Validate items and calculate subtotal
    let calculatedSubtotal = 0
    const validatedItems: {
      productId: string
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
        select: { id: true, price: true, stock: true, name: true, sku: true, isActive: true },
      })

      if (!product) {
        return NextResponse.json({ success: false, message: `Product not found: ${item.productId}` }, { status: 400 })
      }

      if (!product.isActive) {
        return NextResponse.json({ success: false, message: `Product no longer available: ${product.name}` }, { status: 400 })
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { success: false, message: `Insufficient stock for ${product.name}. Available: ${product.stock}` },
          { status: 400 }
        )
      }

      const unitPrice = Number(product.price as unknown as Decimal)
      const itemTotal = unitPrice * item.quantity
      calculatedSubtotal += itemTotal

      validatedItems.push({
        productId: item.productId,
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

    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
          userId,
          status: "pending",
          paymentStatus: "unpaid",
          totalAmount: finalTotal,
          subtotal: calculatedSubtotal,
          tax: tax || 0,
          shipping: shipping || 0,
          discount,
          couponId,
        },
      })

      // Create order items
      await tx.orderItem.createMany({
        data: validatedItems.map((item) => ({
          orderId: newOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          productName: item.productName,
          productSku: item.productSku,
        })),
      })

      // Create shipping address
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

      // Create payment record with pending status
      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          method: paymentMethod || "paystack",
          amount: newOrder.totalAmount,
          status: "unpaid",
          currency: "NGN",
        },
      })

      // Reserve stock (decrement)
      for (const item of validatedItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        })
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

    // Send order confirmation email (non-blocking)
    if (completeOrder) {
      try {
        const { sendOrderConfirmationEmail } = await import('@/lib/email/send-order-email')
        await sendOrderConfirmationEmail(
          completeOrder.user.email,
          completeOrder.user.name,
          {
            orderNumber: completeOrder.orderNumber,
            createdAt: completeOrder.createdAt,
            subtotal: Number(completeOrder.subtotal),
            tax: Number(completeOrder.tax),
            shipping: Number(completeOrder.shipping),
            discount: Number(completeOrder.discount),
            totalAmount: Number(completeOrder.totalAmount),
            orderItems: completeOrder.orderItems.map(item => ({
              productName: item.productName,
              quantity: item.quantity,
              unitPrice: Number(item.unitPrice),
              totalPrice: Number(item.totalPrice),
            })),
            shippingAddress: completeOrder.shippingAddress || undefined,
            paymentStatus: completeOrder.paymentStatus,
            status: completeOrder.status,
          }
        )
      } catch (emailError) {
        // Log error but don't fail the order creation
        console.error('Failed to send order confirmation email:', emailError)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Order created successfully",
      order: completeOrder,
    })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ success: false, message: "Failed to create order" }, { status: 500 })
  }
}
