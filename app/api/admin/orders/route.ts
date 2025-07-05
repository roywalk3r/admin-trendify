import { NextResponse, type NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { adminAuthMiddleware } from "@/lib/admin-auth"
import { z } from "zod"
import { auth } from "@clerk/nextjs/server"

// Order update validation schema
const orderUpdateSchema = z.object({
  id: z.string(),
  status: z.enum(["processing", "shipped", "deivered", "canceled"]).optional(),
  paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]).optional(),
})

export async function GET(req: NextRequest) {
  // Check admin authorization
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get query parameters
    const url = new URL(req.url)
    const status = url.searchParams.get("status")
    const paymentStatus = url.searchParams.get("paymentStatus")
    const search = url.searchParams.get("search")
    const limit = Number.parseInt(url.searchParams.get("limit") || "50")
    const page = Number.parseInt(url.searchParams.get("page") || "1")

    // Build filter conditions
    const where: any = {}

    if (status) {
      where.status = status
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus
    }

    if (search) {
      where.OR = [
        { id: { contains: search } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ]
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get orders with pagination
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
                  images: true,
                },
              },
            },
          },
          payment: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ])

    return createApiResponse({
      data: {
        orders,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          page,
          limit,
        },
      },
      status: 200,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(req: NextRequest) {
  // Check admin authorization
  const authResponse = await adminAuthMiddleware(req)
  if (authResponse.status !== 200) {
    return authResponse
  }

  try {
    const body = await req.json()
    const { id, ...data } = orderUpdateSchema.parse(body)

    // Manually map field names if Prisma expects `payment_status`
    const dbData: any = {}
    if (data.status) dbData.status = data.status
    if (data.paymentStatus) dbData.payment_status = data.paymentStatus // Use snake_case

    const order = await prisma.order.update({
      where: { id },
      data: dbData,
      include: {
        user: { select: { id: true, name: true, email: true } },
        orderItems: {
          include: {
            product: { select: { id: true, name: true, images: true } },
          },
        },
        payment: true,
      },
    })

    return createApiResponse({ data: order, status: 200 })
  } catch (error) {
    return handleApiError(error)
  }
}
