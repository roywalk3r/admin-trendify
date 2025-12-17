import { type NextRequest } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"
import { createApiResponse } from "@/lib/api-utils"

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return createApiResponse({ error: "Unauthorized", status: 401 })

    const url = new URL(req.url)
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const user = await prisma.user.findUnique({ where: { clerkId: userId }, select: { id: true } })
    if (!user) return createApiResponse({ error: "User not found", status: 404 })

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          payment: true,
          orderItems: { take: 1, include: { product: { select: { images: true } } } },
        },
      }),
      prisma.order.count({ where: { userId: user.id } }),
    ])

    const safe = orders.map((o: any) => ({
      ...o,
      totalAmount: Number(o.totalAmount),
      subtotal: Number(o.subtotal),
      tax: Number(o.tax),
      shipping: Number(o.shipping),
      discount: Number(o.discount ?? 0),
      payment: o.payment
        ? {
            ...o.payment,
            amount: Number(o.payment.amount),
            gatewayFee: o.payment.gatewayFee != null ? Number(o.payment.gatewayFee) : null,
          }
        : null,
      orderItems: (o.orderItems || []).map((it: any) => ({
        ...it,
        unitPrice: Number(it.unitPrice),
        totalPrice: Number(it.totalPrice),
      })),
    }))

    return createApiResponse({
      status: 200,
      data: {
        orders: safe,
        pagination: { total, page, limit, pages: Math.ceil(total / limit) },
      },
    })
  } catch (e: any) {
    return createApiResponse({ error: String(e?.message || "Internal Server Error"), status: 500 })
  }
}
