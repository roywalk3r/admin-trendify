import { NextRequest } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"
import { createApiResponse } from "@/lib/api-utils"

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  try {
    const { userId } = await auth()
    if (!userId) return createApiResponse({ error: "Unauthorized", status: 401 })

    const id = params.id
    if (!id) return createApiResponse({ error: "id is required", status: 400 })

    const user = await prisma.user.findUnique({ where: { clerkId: userId }, select: { id: true } })
    if (!user) return createApiResponse({ error: "User not found", status: 404 })

    const order = await prisma.order.findFirst({
      where: { id, userId: user.id },
      include: {
        payment: true,
        orderItems: { include: { product: { select: { images: true } } } },
        shippingAddress: true,
        driver: true,
        coupon: true,
      },
    })

    if (!order) return createApiResponse({ error: "Order not found", status: 404 })

    const safe: any = {
      ...order,
      totalAmount: Number((order as any).totalAmount),
      subtotal: Number((order as any).subtotal),
      tax: Number((order as any).tax),
      shipping: Number((order as any).shipping),
      discount: Number((order as any).discount ?? 0),
      payment: (order as any).payment
        ? {
            ...(order as any).payment,
            amount: Number((order as any).payment.amount),
            gatewayFee:
              (order as any).payment.gatewayFee != null
                ? Number((order as any).payment.gatewayFee)
                : null,
          }
        : null,
      orderItems: ((order as any).orderItems || []).map((it: any) => ({
        ...it,
        unitPrice: Number(it.unitPrice),
        totalPrice: Number(it.totalPrice),
      })),
    }

    return createApiResponse({ data: safe, status: 200 })
  } catch (e: any) {
    return createApiResponse({ error: String(e?.message || "Internal Server Error"), status: 500 })
  }
}
