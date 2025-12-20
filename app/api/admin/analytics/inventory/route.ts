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

    // Get all products with inventory data
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        price: true,
        stock: true,
        status: true,
        category: {
          select: {
            id: true,
            name: true
          }
        },
        createdAt: true,
        updatedAt: true,
        items: {
          where: {
            order: {
              status: { not: 'cancelled' }
            },
            createdAt: { gte: from }
          },
          select: {
            quantity: true,
            price: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            items: {
              where: {
                order: {
                  status: { not: 'cancelled' }
                }
              }
            }
          }
        }
      }
    })

    // Calculate inventory metrics
    let totalProducts = products.length
    let totalStock = 0
    let outOfStock = 0
    let lowStock = 0
    let overstock = 0
    let deadStock = 0
    let totalValue = 0
    const categoryStock = new Map<string, { stock: number; value: number; count: number }>()
    const stockTurnover = new Map<string, number>()
    const restockRecommendations = new Map<string, { priority: string; suggestedQty: number; reason: string }>()
    const lowStockProducts: Array<{
      id: any;
      name: any;
      sku: any;
      currentStock: any;
      avgDailySales: number;
      daysUntilOutOfStock: number;
      priority: string;
    }> = []
    const overstockProducts: Array<{
      id: any;
      name: any;
      sku: any;
      currentStock: any;
      avgDailySales: number;
      daysOfSupply: number;
      excessValue: number;
    }> = []

    // Calculate 30-day and 90-day sales for each product
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    // Get historical sales data
    const historicalSales = await prisma.product.findMany({
      select: {
        id: true,
        items: {
          where: {
            order: {
              status: { not: 'cancelled' }
            },
            createdAt: { gte: ninetyDaysAgo }
          },
          select: {
            quantity: true,
            createdAt: true
          }
        }
      }
    })

    const salesByProduct = new Map<string, { last30Days: number; last90Days: number }>()
    historicalSales.forEach(product => {
      const last30Days = product.items
        .filter(item => item.createdAt >= thirtyDaysAgo)
        .reduce((sum, item) => sum + item.quantity, 0)
      const last90Days = product.items
        .reduce((sum, item) => sum + item.quantity, 0)
      salesByProduct.set(product.id, { last30Days, last90Days })
    })

    products.forEach(product => {
      const currentStock = product.stock
      const categoryName = product.category?.name || 'Uncategorized'
      const productValue = currentStock * Number(product.price)
      
      // Category aggregation
      if (!categoryStock.has(categoryName)) {
        categoryStock.set(categoryName, { stock: 0, value: 0, count: 0 })
      }
      const catData = categoryStock.get(categoryName)!
      catData.stock += currentStock
      catData.value += productValue
      catData.count += 1

      // Global metrics
      totalStock += currentStock
      totalValue += productValue

      // Stock status classification
      if (currentStock === 0) {
        outOfStock++
      } else if (currentStock < 10) {
        lowStock++
      } else if (currentStock > 100) {
        overstock++
      }

      // Dead stock (no sales in 90 days)
      const sales = salesByProduct.get(product.id)
      if (sales && sales.last90Days === 0 && currentStock > 0) {
        deadStock++
      }

      // Stock turnover calculation
      if (sales && sales.last90Days > 0) {
        const avgStock = (currentStock + sales.last90Days) / 2
        const turnover = (sales.last90Days / avgStock) * 4 // Annualized
        stockTurnover.set(product.id, turnover)
      }

      // Low stock alert
      if (currentStock > 0 && currentStock < 10) {
        const salesData = salesByProduct.get(product.id)
        const avgDailySales = salesData ? salesData.last30Days / 30 : 0
        const daysUntilOutOfStock = avgDailySales > 0 ? Math.floor(currentStock / avgDailySales) : 999
        
        lowStockProducts.push({
          id: product.id,
          name: product.name,
          sku: product.sku,
          currentStock,
          avgDailySales,
          daysUntilOutOfStock,
          priority: daysUntilOutOfStock < 3 ? 'Critical' : daysUntilOutOfStock < 7 ? 'High' : 'Medium'
        })
      }

      // Overstock alert
      if (currentStock > 100) {
        const salesData = salesByProduct.get(product.id)
        const avgDailySales = salesData ? salesData.last30Days / 30 : 0
        const daysOfSupply = avgDailySales > 0 ? Math.floor(currentStock / avgDailySales) : 999
        
        overstockProducts.push({
          id: product.id,
          name: product.name,
          sku: product.sku,
          currentStock,
          avgDailySales,
          daysOfSupply,
          excessValue: (currentStock - 50) * Number(product.price) // Assuming optimal stock of 50
        })
      }

      // Restock recommendations
      if (currentStock === 0) {
        const salesData = salesByProduct.get(product.id)
        const monthlySales = salesData ? salesData.last30Days : 0
        const suggestedQty = Math.ceil(monthlySales * 1.5) // 1.5 months of stock
        
        restockRecommendations.set(product.id, {
          priority: monthlySales > 10 ? 'Urgent' : monthlySales > 0 ? 'High' : 'Low',
          suggestedQty,
          reason: monthlySales > 0 ? `Based on ${monthlySales} sales last month` : 'No recent sales - consider discontinuing'
        })
      } else if (currentStock < 10 && sales && sales.last30Days > currentStock) {
        const monthlySales = sales.last30Days
        const suggestedQty = Math.ceil(monthlySales * 0.5) // Add half month of stock
        
        restockRecommendations.set(product.id, {
          priority: 'Medium',
          suggestedQty,
          reason: `Running low based on recent sales velocity`
        })
      }
    })

    // Calculate average turnover rate
    const validTurnovers = Array.from(stockTurnover.values()).filter(t => t > 0 && t < 100)
    const avgTurnoverRate = validTurnovers.length > 0 
      ? validTurnovers.reduce((sum, rate) => sum + rate, 0) / validTurnovers.length 
      : 0

    // Format category data
    const categoryData = Array.from(categoryStock.entries())
      .map(([name, data]) => ({
        category: name,
        stock: data.stock,
        value: data.value,
        count: data.count,
        avgValuePerItem: data.count > 0 ? data.value / data.count : 0
      }))
      .sort((a, b) => b.value - a.value)

    // Sort alerts
    lowStockProducts.sort((a, b) => a.daysUntilOutOfStock - b.daysUntilOutOfStock)
    overstockProducts.sort((a, b) => b.excessValue - a.excessValue)

    // Calculate inventory health score
    const healthScore = Math.max(0, Math.min(100, 
      100 - (outOfStock * 5) - (lowStock * 2) - (deadStock * 3) - (overstock * 1)
    ))

    return createApiResponse({
      data: {
        summary: {
          totalProducts,
          totalStock,
          totalValue,
          outOfStock,
          lowStock,
          overstock,
          deadStock,
          avgTurnoverRate: Number(avgTurnoverRate.toFixed(2)),
          healthScore
        },
        charts: {
          categoryDistribution: categoryData,
          stockStatus: [
            { status: 'In Stock', count: totalProducts - outOfStock - lowStock },
            { status: 'Low Stock', count: lowStock },
            { status: 'Out of Stock', count: outOfStock }
          ]
        },
        alerts: {
          lowStock: lowStockProducts.slice(0, 20),
          overstock: overstockProducts.slice(0, 20),
          restockRecommendations: Array.from(restockRecommendations.entries())
            .map(([id, data]) => ({ productId: id, ...data }))
            .sort((a, b) => {
              const priorityOrder = { 'Urgent': 0, 'High': 1, 'Medium': 2, 'Low': 3 }
              return priorityOrder[a.priority] - priorityOrder[b.priority]
            })
            .slice(0, 20)
        },
        insights: {
          topCategories: categoryData.slice(0, 5),
          deadStockValue: deadStock * 100, // Estimated average value
          potentialSavings: overstockProducts.reduce((sum, p) => sum + p.excessValue, 0),
          urgentRestockCount: restockRecommendations.size
        },
        range: { from, to }
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
}
