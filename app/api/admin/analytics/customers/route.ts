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

    // Get customers with their order data
    const customers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        lastLoginAt: true,
        orders: {
          where: {
            createdAt: { gte: from, lte: to },
            status: { not: "cancelled" }
          },
          select: {
            id: true,
            total: true,
            createdAt: true,
            status: true,
            items: {
              select: {
                quantity: true,
                price: true
              }
            }
          }
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            approved: true,
            createdAt: true
          }
        },
        wishlist: {
          select: {
            id: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    // Get guest orders
    const guestOrders = await prisma.order.findMany({
      where: {
        user: null,
        createdAt: { gte: from, lte: to },
        status: { not: "cancelled" }
      },
      select: {
        id: true,
        total: true,
        createdAt: true,
        email: true
      }
    })

    // Calculate metrics
    let totalCustomers = customers.length
    let newCustomers = 0
    let activeCustomers = 0
    let returningCustomers = 0
    let totalRevenue = 0
    let totalOrders = 0
    let avgOrderValue = 0
    const customersByDay = new Map<string, number>()
    const ordersByDay = new Map<string, number>()
    const revenueByDay = new Map<string, number>()
    const topCustomers = new Map<string, { name: string; email: string; orders: number; revenue: number }>()
    const customerSegments = new Map<string, number>()

    customers.forEach(customer => {
      // New customers in period
      if (customer.createdAt >= from && customer.createdAt <= to) {
        newCustomers++
      }

      // Customer activity
      const orderCount = customer.orders.length
      const customerRevenue = customer.orders.reduce((sum, order) => sum + Number(order.total), 0)
      
      totalOrders += orderCount
      totalRevenue += customerRevenue

      if (orderCount > 0) {
        activeCustomers++
        if (orderCount > 1) {
          returningCustomers++
        }
      }

      // Daily metrics
      const signUpDay = customer.createdAt.toISOString().slice(0, 10)
      customersByDay.set(signUpDay, (customersByDay.get(signUpDay) || 0) + 1)

      customer.orders.forEach(order => {
        const orderDay = order.createdAt.toISOString().slice(0, 10)
        ordersByDay.set(orderDay, (ordersByDay.get(orderDay) || 0) + 1)
        revenueByDay.set(orderDay, (revenueByDay.get(orderDay) || 0) + Number(order.total))
      })

      // Top customers
      if (orderCount > 0) {
        topCustomers.set(customer.id, {
          name: customer.name || 'Unknown',
          email: customer.email,
          orders: orderCount,
          revenue: customerRevenue
        })
      }

      // Customer segmentation
      if (orderCount === 0) {
        customerSegments.set('Inactive', (customerSegments.get('Inactive') || 0) + 1)
      } else if (orderCount === 1) {
        customerSegments.set('One-time', (customerSegments.get('One-time') || 0) + 1)
      } else if (orderCount <= 5) {
        customerSegments.set('Regular', (customerSegments.get('Regular') || 0) + 1)
      } else {
        customerSegments.set('VIP', (customerSegments.get('VIP') || 0) + 1)
      }
    })

    avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Calculate customer lifetime value (CLV)
    const clv = activeCustomers > 0 ? totalRevenue / activeCustomers : 0

    // Calculate retention rate
    const previousPeriodFrom = new Date(from)
    previousPeriodFrom.setDate(previousPeriodFrom.getDate() - days)
    
    const previousCustomers = await prisma.user.count({
      where: {
        createdAt: { lt: from, gte: previousPeriodFrom }
      }
    })
    
    const retainedCustomers = await prisma.user.count({
      where: {
        createdAt: { lt: from },
        orders: {
          some: {
            createdAt: { gte: from, lte: to }
          }
        }
      }
    })
    
    const retentionRate = previousCustomers > 0 ? (retainedCustomers / previousCustomers) * 100 : 0

    // Format time series
    const timeSeries: { date: string; newCustomers: number; orders: number; revenue: number }[] = []
    const currentDate = new Date(from)
    while (currentDate <= to) {
      const dayKey = currentDate.toISOString().slice(0, 10)
      timeSeries.push({
        date: dayKey,
        newCustomers: customersByDay.get(dayKey) || 0,
        orders: ordersByDay.get(dayKey) || 0,
        revenue: revenueByDay.get(dayKey) || 0
      } as { date: string; newCustomers: number; orders: number; revenue: number })
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Top customers list
    const topCustomersList = Array.from(topCustomers.entries())
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 10)
      .map(([id, data]) => ({ customerId: id, ...data }))

    // Recent customers
    const recentCustomers = customers
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10)
      .map(c => ({
        id: c.id,
        name: c.name || 'Unknown',
        email: c.email,
        signUpDate: c.createdAt,
        lastLogin: c.lastLoginAt,
        ordersCount: c.orders.length,
        totalSpent: c.orders.reduce((sum, o) => sum + Number(o.total), 0),
        reviewsCount: c.reviews.filter(r => r.approved).length,
        wishlistItems: c.wishlist.length
      }))

    return createApiResponse({
      data: {
        summary: {
          totalCustomers,
          newCustomers,
          activeCustomers,
          returningCustomers,
          guestOrders: guestOrders.length,
          avgOrderValue,
          customerLifetimeValue: clv,
          retentionRate: Number(retentionRate.toFixed(2))
        },
        charts: {
          timeSeries,
          customerSegments: Array.from(customerSegments.entries()).map(([segment, count]) => ({
            segment,
            count
          }))
        },
        lists: {
          topCustomers: topCustomersList,
          recentCustomers
        },
        range: { from, to }
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
}
