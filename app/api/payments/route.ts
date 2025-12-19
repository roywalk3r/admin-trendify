import { NextRequest } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"
import { createApiResponse, handleApiError } from "@/lib/api-utils"

// List payments/transactions for the signed-in user
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return createApiResponse({ status: 401, error: "Unauthorized" })

    const local = await prisma.user.findFirst({ where: { OR: [{ clerkId: userId }, { id: userId }] }, select: { id: true } })
    if (!local) return createApiResponse({ status: 404, error: "User not found" })

    const url = new URL(req.url)
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const limit = Math.min(Math.max(Number.parseInt(url.searchParams.get("limit") || "20"), 1), 50)
    const skip = (page - 1) * limit

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: { order: { userId: local.id } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              totalAmount: true,
              createdAt: true,
            },
          },
        },
      }),
      prisma.payment.count({ where: { order: { userId: local.id } } }),
    ])

    const data = payments.map((p) => ({
      id: p.id,
      orderId: p.orderId,
      orderNumber: p.order?.orderNumber ?? null,
      status: p.status,
      method: p.method,
      provider: (p as any)?.provider ?? null,
      transactionId: p.transactionId,
      amount: Number(p.amount),
      currency: p.currency,
      gatewayFee: p.gatewayFee != null ? Number(p.gatewayFee) : null,
      metadata: p.metadata,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      orderCreatedAt: p.order?.createdAt ?? null,
      orderStatus: p.order?.status ?? null,
    }))

    return createApiResponse({
      status: 200,
      data: {
        payments: data,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
