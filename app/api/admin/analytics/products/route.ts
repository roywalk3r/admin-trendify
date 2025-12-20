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

    // Get product views from audit logs
    const productViews = await prisma.audit.findMany({
      where: {
        action: "product_view",
        createdAt: { gte: from, lte: to }
      },
      select: {
        entityId: true,
        createdAt: true,
        newValue: true
      }
    })

    // Get all products with their data
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        comparePrice: true,
        costPrice: true,
        stock: true,
        status: true,
        category: {
          select: {
            id: true,
            name: true
          }
        },
        images: true,
        createdAt: true,
        updatedAt: true,
        orderItems: {
          select: {
            quantity: true,
            unitPrice: true,
            totalPrice: true,
            order: {
              select: {
                status: true,
                createdAt: true
              }
            }
          }
        },
        reviews: {
          select: {
            rating: true,
            isApproved: true
          }
        }
      }
    })

    // Calculate metrics
    let totalProducts = products.length
    let activeProducts = 0
    let outOfStock = 0
    let lowStock = 0
    const viewCounts = new Map<string, number>()
    const viewsByDay = new Map<string, number>()
    const categoryPerformance = new Map<string, { count: number; views: number; sales: number }>()
    const topViewed = new Map<string, { name: string; views: number; sales: number }>()
    const topSelling = new Map<string, { name: string; quantity: number; revenue: number }>()

    // Process product views
    productViews.forEach(view => {
      const productId = view.entityId
      viewCounts.set(productId, (viewCounts.get(productId) || 0) + 1)
      
      const dayKey = view.createdAt.toISOString().slice(0, 10)
      viewsByDay.set(dayKey, (viewsByDay.get(dayKey) || 0) + 1)
    })

    // Process products
    products.forEach(product => {
      // Status counts
      if (product.status === 'active') activeProducts++
      if (product.stock <= 0) outOfStock++
      else if (product.stock < 10) lowStock++

      const views = viewCounts.get(product.id) || 0
      const categoryName = product.category?.name || 'Uncategorized'
      
      // Category performance
      if (!categoryPerformance.has(categoryName)) {
        categoryPerformance.set(categoryName, { count: 0, views: 0, sales: 0 })
      }
      const catPerf = categoryPerformance.get(categoryName)!
      catPerf.count++
      catPerf.views += views

      // Calculate sales
      let totalSold = 0
      let totalRevenue = 0
      product.orderItems.forEach(item => {
        if (item.order.status !== 'canceled') {
          totalSold += item.quantity
          totalRevenue += Number(item.totalPrice ?? item.quantity * Number(item.unitPrice ?? 0))
        }
      })

      catPerf.sales += totalRevenue

      // Top viewed products
      topViewed.set(product.id, {
        name: product.name,
        views,
        sales: totalSold
      })

      // Top selling products
      if (totalSold > 0) {
        topSelling.set(product.id, {
          name: product.name,
          quantity: totalSold,
          revenue: totalRevenue
        })
      }
    })

    // Calculate average rating
    let totalRatings = 0
    let approvedRatings = 0
    products.forEach(product => {
      product.reviews.forEach(review => {
        if (review.isApproved) {
          totalRatings += review.rating
          approvedRatings++
        }
      })
    })
    const avgRating = approvedRatings > 0 ? totalRatings / approvedRatings : 0

    // Format time series for views
    const viewTimeSeries: { date: string; views: number }[] = []
    const currentDate = new Date(from)
    while (currentDate <= to) {
      const dayKey = currentDate.toISOString().slice(0, 10)
      viewTimeSeries.push({
        date: dayKey,
        views: viewsByDay.get(dayKey) || 0
      } as { date: string; views: number })
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Sort and limit lists
    const topViewedList = Array.from(topViewed.entries())
      .sort((a, b) => b[1].views - a[1].views)
      .slice(0, 10)
      .map(([id, data]) => ({ productId: id, ...data }))

    const topSellingList = Array.from(topSelling.entries())
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 10)
      .map(([id, data]) => ({ productId: id, ...data }))

    const categoryList = Array.from(categoryPerformance.entries())
      .map(([name, data]) => ({ category: name, ...data }))
      .sort((a, b) => b.sales - a.sales)

    // Recently added products
    const recentProducts = products
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10)
      .map(p => ({
        id: p.id,
        name: p.name,
        price: Number(p.price),
        stock: p.stock,
        status: p.status,
        category: p.category?.name || 'Uncategorized',
        createdAt: p.createdAt
      }))

    return createApiResponse({
      data: {
        summary: {
          totalProducts,
          activeProducts,
          outOfStock,
          lowStock,
          avgRating: Number(avgRating.toFixed(2)),
          totalViews: productViews.length
        },
        charts: {
          viewTimeSeries,
          categoryPerformance: categoryList
        },
        lists: {
          topViewed: topViewedList,
          topSelling: topSellingList,
          recentProducts
        },
        range: { from, to }
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
}
