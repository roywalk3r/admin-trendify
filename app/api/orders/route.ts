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

    const {searchParams} = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")
    const paymentStatus = searchParams.get("paymentStatus")
    const userId = searchParams.get("userId")

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (status) where.status = status
    if (paymentStatus) where.paymentStatus = paymentStatus
    if (userId) where.userId = userId

    // Fetch the order with related data
    const order = await prisma.order.findUnique({
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
    })

    if (!order) {
      return NextResponse.json({success: false, message: "Order not found"}, {status: 404})
    }

    return NextResponse.json({success: true, order})
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({success: false, message: "Failed to fetch order"}, {status: 500})
  }
}


export async function POST(request: NextRequest) {
  try {
    const {userId, items, shippingAddress, paymentMethod, total, subtotal, tax, shipping} = await request.json()

    // Validate required fields
    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({success: false, message: "Missing required fields"}, {status: 400})
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

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { id: true, price: true, stock: true, name: true, sku: true },
      })

      if (!product) {
        return NextResponse.json({ success: false, message: `Product ${item.productId} not found` }, { status: 400 })
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
            { success: false, message: `Insufficient stock for product ${item.productId}` },
            { status: 400 },
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
        productSku: product.sku ?? undefined,
      })
    }

    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber: `ORD-${Date.now()}`,
          userId,
          status: "pending",
          paymentStatus: "unpaid",
          totalAmount: total || calculatedSubtotal + (tax || 0) + (shipping || 0),
          subtotal: subtotal || calculatedSubtotal,
          tax: tax || 0,
          shipping: shipping || 0,
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
          productSku: item.productSku ?? null,
        })),
      })

      // Create shipping address if provided
      if (shippingAddress) {
        await tx.shippingAddress.create({
          data: {
            orderId: newOrder.id,
            ...shippingAddress,
          },
        })
      }

      // Create payment record
      if (paymentMethod) {
        await tx.payment.create({
          data: {
            orderId: newOrder.id,
            method: paymentMethod,
            amount: newOrder.totalAmount,
            status: "paid",
          },
        })
      }

      // Update product stock
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
