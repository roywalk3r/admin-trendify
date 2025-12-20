import prisma from "@/lib/prisma"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import type { NextRequest } from "next/server"
import { isAdmin } from "@/lib/admin-auth"

export async function GET(req: NextRequest) {
  try {
    const admin = await isAdmin()
    const isDev = process.env.NODE_ENV !== "production"
    if (!admin && !isDev) {
      return createApiResponse({ error: "Forbidden", status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const days = Number(searchParams.get("days") || 30)
    const to = new Date()
    const from = new Date()
    from.setDate(to.getDate() - (isNaN(days) ? 30 : days))

    // Get orders data
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: from, lte: to },
        status: { not: "cancelled" }
      },
      select: {
        total: true,
        subtotal: true,
        shippingFee: true,
        tax: true,
        status: true,
        paymentStatus: true,
        createdAt: true,
        items: {
          select: {
            quantity: true,
            price: true,
            product: {
              select: {
                id: true,
                name: true,
                price: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    // Calculate metrics
    let totalRevenue = 0
    let totalOrders = orders.length
    let totalItems = 0
    let avgOrderValue = 0
    const statusCounts = new Map<string, number>()
    const paymentStatusCounts = new Map<string, number>()
    const topProducts = new Map<string, { name: string; quantity: number; revenue: number }>()
    const revenueByDay = new Map<string, number>()
    const ordersByDay = new Map<string, number>()

    orders.forEach(order => {
      const orderTotal = Number(order.total) || 0
      totalRevenue += orderTotal
      totalItems += order.items.reduce((sum, item) => sum + item.quantity, 0)

      // Status counts
      statusCounts.set(order.status, (statusCounts.get(order.status) || 0) + 1)
      paymentStatusCounts.set(order.paymentStatus, (paymentStatusCounts.get(order.paymentStatus) || 0) + 1)

      // Top products
      order.items.forEach(item => {
        const productId = item.product.id
        const productName = item.product.name
        const quantity = item.quantity
        const revenue = quantity * Number(item.price)

        if (topProducts.has(productId)) {
          const existing = topProducts.get(productId)!
          existing.quantity += quantity
          existing.revenue += revenue
        } else {
          topProducts.set(productId, { name: productName, quantity, revenue })
        }
      })

      // Revenue by day
      const dayKey = order.createdAt.toISOString().slice(0, 10)
      revenueByDay.set(dayKey, (revenueByDay.get(dayKey) || 0) + orderTotal)
      ordersByDay.set(dayKey, (ordersByDay.get(dayKey) || 0) + 1)
    })

    avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Calculate growth rates
    const midPoint = new Date((from.getTime() + to.getTime()) / 2)
    const firstHalf = orders.filter(o => o.createdAt < midPoint)
    const secondHalf = orders.filter(o => o.createdAt >= midPoint)
    
    const firstHalfRevenue = firstHalf.reduce((sum, o) => sum + Number(o.total), 0)
    const secondHalfRevenue = secondHalf.reduce((sum, o) => sum + Number(o.total), 0)
    const revenueGrowth = firstHalfRevenue > 0 ? ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100 : 0

    // Format time series
    const timeSeries: { date: string; revenue: number; orders: number }[] = []
    const currentDate = new Date(from)
    while (currentDate <= to) {
      const dayKey = currentDate.toISOString().slice(0, 10)
      timeSeries.push({
        date: dayKey,
        revenue: revenueByDay.get(dayKey) || 0,
        orders: ordersByDay.get(dayKey) || 0
      } as { date: string; revenue: number; orders: number })
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Top products list
    const topProductsList = Array.from(topProducts.entries())
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 10)
      .map(([id, data]) => ({
        productId: id,
        name: data.name,
        quantitySold: data.quantity,
        revenue: data.revenue
      }))

    // Recent orders
    const recentOrders = orders.slice(0, 10).map(order => ({
      id: order.id,
      date: order.createdAt,
      total: Number(order.total),
      status: order.status,
      paymentStatus: order.paymentStatus,
      customerEmail: order.user?.email || 'Guest',
      itemCount: order.items.length
    }))

    return createApiResponse({
      data: {
        summary: {
          totalRevenue,
          totalOrders,
          totalItems,
          avgOrderValue,
          revenueGrowth
        },
        charts: {
          timeSeries,
          statusDistribution: Array.from(statusCounts.entries()).map(([status, count]) => ({
            status,
            count
          })),
          paymentStatusDistribution: Array.from(paymentStatusCounts.entries()).map(([status, count]) => ({
            status,
            count
          }))
        },
        topProducts: topProductsList,
        recentOrders,
        range: { from, to }
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
}
