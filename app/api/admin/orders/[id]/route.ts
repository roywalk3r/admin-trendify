import prisma from "@/lib/prisma"
import type { NextRequest } from "next/server"
import { z } from "zod"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { sendShippingNotificationEmail } from "@/lib/email"
import { auth } from "@clerk/nextjs/server"

// Validation schema for PATCH
const orderStatusSchema = z.object({
  status: z.enum(["pending", "processing", "shipped", "delivered", "canceled"]).optional(),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
  driverId: z.string().cuid().optional(),
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
    const { status, trackingNumber, notes, driverId } = parsed.data

    // Load order with address for assignment logic
    const existing = await prisma.order.findUnique({
      where: { id },
      include: { user: true, shippingAddress: true, driver: true },
    })
    if (!existing) return createApiResponse({ status: 404, error: "Order not found" })

    // Helper to compute estimated delivery if missing
    const ensureEta = (current?: Date | null) => {
      if (current) return current
      const d = new Date()
      d.setDate(d.getDate() + 3)
      return d
    }

    // Manual assignment path if driverId provided
    if (driverId) {
      // Validate driver
      const driver = await prisma.driver.findUnique({ where: { id: driverId, isActive: true } as any })
      if (!driver) return createApiResponse({ status: 404, error: "Driver not found or inactive" })

      // Service area constraint: if driver has serviceCities, order city must be included
      const orderCityName = existing.shippingAddress?.city
      if (orderCityName) {
        const serviceLinks = await prisma.driverServiceCity.findMany({ where: { driverId: driver.id }, include: { city: true } })
        if (serviceLinks.length > 0) {
          const ok = serviceLinks.some((l) => l.city.name.toLowerCase() === orderCityName.toLowerCase())
          if (!ok) return createApiResponse({ status: 409, error: "Driver does not serve the destination city" })
        }
      }

      // Daily cap enforcement
      const CAP = Number(process.env.DRIVER_DAILY_CAP || 20)
      const start = new Date(); start.setHours(0,0,0,0)
      const todayCount = await prisma.order.count({ where: { driverId: driver.id, createdAt: { gte: start } } })
      if (todayCount >= CAP) return createApiResponse({ status: 409, error: "Driver has reached daily capacity" })

      const updated = await prisma.order.update({
        where: { id },
        data: {
          driverId: driver.id,
          // Allow optional status/fields updates alongside manual assign
          status: status ?? existing.status,
          trackingNumber: trackingNumber ?? existing.trackingNumber ?? undefined,
          notes: notes ?? existing.notes ?? undefined,
          estimatedDelivery: ensureEta(existing.estimatedDelivery),
        },
        include: { user: true, shippingAddress: true, driver: true, payment: true, orderItems: true },
      })
      await prisma.driver.update({ where: { id: driver.id }, data: { totalTrips: { increment: 1 } } })
      return createApiResponse({ status: 200, data: updated })
    }

    // Otherwise, perform normal status update
    let updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: status ?? existing.status, trackingNumber, notes },
      include: {
        user: { select: { id: true, name: true, email: true } },
        orderItems: true,
        shippingAddress: true,
        payment: true,
        driver: true,
      },
    })

    // If moved to shipped and no driver assigned, auto-assign considering daily cap and service areas
    if (updatedOrder.status === "shipped" && !updatedOrder.driverId) {
      const orderCityName = updatedOrder.shippingAddress?.city || null
      let eligibleDriverIds: string[] | null = null
      if (orderCityName) {
        const city = await prisma.deliveryCity.findFirst({ where: { name: { equals: orderCityName, mode: "insensitive" } } })
        if (city) {
          const links = await prisma.driverServiceCity.findMany({ where: { cityId: city.id }, select: { driverId: true } })
          if (links.length > 0) eligibleDriverIds = links.map((l) => l.driverId)
        }
      }

      const whereActive: any = { isActive: true }
      if (eligibleDriverIds) whereActive.id = { in: eligibleDriverIds }

      const activeDrivers = await prisma.driver.findMany({ where: whereActive })
      if (activeDrivers.length > 0) {
        const CAP = Number(process.env.DRIVER_DAILY_CAP || 20)
        const start = new Date(); start.setHours(0,0,0,0)

        // Compute today's load per driver and filter by cap
        const loads = await prisma.order.groupBy({
          by: ["driverId"],
          where: { driverId: { in: activeDrivers.map(d => d.id) }, createdAt: { gte: start } },
          _count: { _all: true },
        })
        const loadMap = new Map<string, number>(loads.map(l => [l.driverId!, l._count._all]))

        const candidates = activeDrivers
          .map(d => ({ driver: d, today: loadMap.get(d.id) || 0 }))
          .filter(x => x.today < CAP)
          .sort((a,b) => a.today - b.today || (a.driver.updatedAt.getTime() - b.driver.updatedAt.getTime()))

        const pick = candidates[0]?.driver
        if (pick) {
          updatedOrder = await prisma.order.update({
            where: { id: updatedOrder.id },
            data: {
              driverId: pick.id,
              estimatedDelivery: ensureEta(updatedOrder.estimatedDelivery),
            },
            include: { user: true, shippingAddress: true, driver: true, payment: true, orderItems: true },
          })
          await prisma.driver.update({ where: { id: pick.id }, data: { totalTrips: { increment: 1 } } })

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
