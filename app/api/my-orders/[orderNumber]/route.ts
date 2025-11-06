import { NextRequest } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"
import { createApiResponse } from "@/lib/api-utils"

export async function GET(req: NextRequest, { params }: { params: { orderNumber: string } }) {
  try {
    const { userId } = await auth()
    if (!userId) return createApiResponse({ error: "Unauthorized", status: 401 })

    const orderNumber = params.orderNumber
    if (!orderNumber) return createApiResponse({ error: "orderNumber is required", status: 400 })

    const user = await prisma.user.findUnique({ where: { clerkId: userId }, select: { id: true } })
    if (!user) return createApiResponse({ error: "User not found", status: 404 })

    const order = await prisma.order.findFirst({
      where: { orderNumber, userId: user.id },
      include: {
        payment: true,
        orderItems: { include: { product: { select: { images: true } } } },
        shippingAddress: true,
        driver: true,
        coupon: true,
      },
    })

    if (!order) return createApiResponse({ error: "Order not found", status: 404 })

    return createApiResponse({ data: order, status: 200 })
  } catch (e: any) {
    return createApiResponse({ error: String(e?.message || "Internal Server Error"), status: 500 })
  }
}
