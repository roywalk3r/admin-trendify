import prisma from "@/lib/prisma"
import type { NextRequest } from "next/server"
import { z } from "zod"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { sendShippingNotificationEmail } from "@/lib/email"
import { auth } from "@clerk/nextjs/server"

// Validation schema for PATCH
const orderStatusSchema = z.object({
  status: z.enum(["pending", "processing", "shipped", "delivered", "canceled"]),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
})

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        orderItems: { include: { product: { select: { id: true, name: true, slug: true, images: true, price: true } } } },
        shippingAddress: true,
        payment: true,
        driver: true,
        coupon: true,
      },
    })
    if (!order) return createApiResponse({ status: 404, error: "Order not found" })
    return createApiResponse({ status: 200, data: order })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()
    if (!userId) return createApiResponse({ status: 401, error: "Unauthorized" })

    const { id } = await context.params
    const body = await req.json()
    const parsed = orderStatusSchema.safeParse(body)
    if (!parsed.success) return createApiResponse({ status: 400, error: "Invalid payload" })
    const { status, trackingNumber, notes } = parsed.data

    // Update order core fields
    let updatedOrder = await prisma.order.update({
      where: { id },
      data: { status, trackingNumber, notes },
      include: {
        user: { select: { id: true, name: true, email: true } },
        orderItems: true,
        shippingAddress: true,
        payment: true,
        driver: true,
      },
    })

    // If moved to shipped and no driver assigned, auto-assign least-busy active driver
    if (updatedOrder.status === "shipped" && !updatedOrder.driverId) {
      const driver = await prisma.driver.findFirst({ where: { isActive: true }, orderBy: [{ totalTrips: "asc" }, { updatedAt: "asc" }] })
      if (driver) {
        updatedOrder = await prisma.order.update({
          where: { id: updatedOrder.id },
          data: {
            driverId: driver.id,
            estimatedDelivery: updatedOrder.estimatedDelivery ?? (() => { const d = new Date(); d.setDate(d.getDate() + 3); return d })(),
          },
          include: { user: true, shippingAddress: true, driver: true, payment: true, orderItems: true },
        })
        await prisma.driver.update({ where: { id: driver.id }, data: { totalTrips: { increment: 1 } } })

        // Send shipping email with optional driver details
        if (updatedOrder.user?.email) {
          try {
            await sendShippingNotificationEmail(updatedOrder.user.email, {
              orderNumber: updatedOrder.orderNumber,
              customerName: updatedOrder.user.name || updatedOrder.user.email.split("@")[0] || "Customer",
              trackingNumber: updatedOrder.trackingNumber || undefined,
              estimatedDelivery: updatedOrder.estimatedDelivery ? new Date(updatedOrder.estimatedDelivery).toLocaleDateString() : undefined,
              driverName: updatedOrder.driver?.name || undefined,
              driverPhone: updatedOrder.driver?.phone || undefined,
              driverEmail: updatedOrder.driver?.email || undefined,
            })
          } catch (e) {
            console.warn("[email] shipping notification failed", e)
          }
        }
      }
    }

    return createApiResponse({ status: 200, data: updatedOrder })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()
    if (!userId) return createApiResponse({ status: 401, error: "Unauthorized" })

    const { id } = await context.params
    const existingOrder = await prisma.order.findUnique({ where: { id } })
    if (!existingOrder) return createApiResponse({ status: 404, error: "Order not found" })
    if (existingOrder.status !== "pending") return createApiResponse({ status: 409, error: "Only pending orders can be deleted" })

    await prisma.$transaction([
      prisma.orderItem.deleteMany({ where: { orderId: id } }),
      prisma.order.delete({ where: { id } }),
    ])
    return createApiResponse({ status: 200, data: { message: "Order deleted successfully" } })
  } catch (error) {
    return handleApiError(error)
  }
}
