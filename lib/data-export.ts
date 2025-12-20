import { prisma } from "@/lib/prisma"
import { format } from "date-fns"

export class DataExporter {
  static async exportProducts(filters?: any) {
    const products = await prisma.product.findMany({
      where: {
        ...filters,
      },
      include: {
        category: true,
        reviews: {
          where: { isApproved: true }
        },
        orderItems: {
          select: {
            quantity: true,
            unitPrice: true,
            totalPrice: true,
            order: {
              select: { status: true }
            }
          }
        }
      },
    })

    return products.map((product) => {
      const filteredItems = product.orderItems.filter((item) => item.order?.status !== 'canceled')
      const totalSold = filteredItems.reduce((sum, item) => sum + item.quantity, 0)
      const totalRevenue = filteredItems.reduce((sum, item) => sum + Number(item.totalPrice ?? 0), 0)
      const avgRating = product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0

      return {
        "Product ID": product.id,
        "Name": product.name,
        "SKU": product.sku || "N/A",
        "Category": product.category?.name || "N/A",
        "Price": Number(product.price),
        "Compare Price": product.comparePrice ? Number(product.comparePrice) : null,
        "Cost Price": product.costPrice ? Number(product.costPrice) : null,
        "Stock": product.stock,
        "Status": product.status,
        "Total Sold": totalSold,
        "Total Revenue": totalRevenue,
        "Average Rating": Number(avgRating.toFixed(2)),
        "Reviews Count": product.reviews.length,
        "Created At": format(product.createdAt, "yyyy-MM-dd HH:mm:ss"),
        "Updated At": format(product.updatedAt, "yyyy-MM-dd HH:mm:ss")
      }
    })
  }

  static async exportOrders(filters?: any) {
    const orders = await prisma.order.findMany({
      where: filters,
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        },
        orderItems: true,
        shippingAddress: true,
      },
    })

    return orders.map((order) => ({
      "Order ID": order.id,
      "Date": format(order.createdAt, "yyyy-MM-dd HH:mm:ss"),
      "Customer": order.user?.name || "Guest",
      "Email": order.user?.email || order.email || "N/A",
      "Status": order.status,
      "Payment Status": order.paymentStatus,
      "Subtotal": order.subtotal,
      "Shipping": order.shipping,
      "Tax": order.tax,
      "Total": order.totalAmount,
      "Items Count": order.orderItems.length,
      "Shipping Address": `${order.shippingAddress?.street || ''}, ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.country || ''}`,
    }))
  }

  static async exportUsers(filters?: any) {
    const users = await prisma.user.findMany({
      where: {
        ...filters,
      },
      include: {
        orders: {
          where: {
            status: { not: 'canceled' }
          }
        },
        reviews: {
          where: { isApproved: true }
        },
        wishlist: {
          include: { items: true }
        }
      },
    })

    return users.map((user) => {
      const totalOrders = user.orders.length
      const totalSpent = user.orders.reduce((sum, order) => sum + Number(order.totalAmount), 0)
      const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0
      const avgRating = user.reviews.length > 0
        ? user.reviews.reduce((sum, r) => sum + r.rating, 0) / user.reviews.length
        : 0

      return {
        "Customer ID": user.id,
        "Name": user.name || "N/A",
        "Email": user.email,
        "Phone": user.phone || "N/A",
        "Sign Up Date": format(user.createdAt, "yyyy-MM-dd HH:mm:ss"),
        "Last Login": user.lastLoginAt ? format(user.lastLoginAt, "yyyy-MM-dd HH:mm:ss") : "Never",
        "Total Orders": totalOrders,
        "Total Spent": totalSpent,
        "Average Order Value": avgOrderValue,
        "Reviews Count": user.reviews.length,
        "Average Rating": Number(avgRating.toFixed(2)),
        "Wishlist Items": user.wishlist?.items?.length ?? 0,
        "Status": user.status || "active"
      }
    })
  }

  static async exportInventory(filters?: any) {
    const products = await prisma.product.findMany({
      where: filters,
      select: {
        id: true,
        name: true,
        sku: true,
        price: true,
        stock: true,
        status: true,
        category: {
          select: {
            name: true
          }
        },
        createdAt: true,
        updatedAt: true,
        orderItems: {
          where: {
            order: {
              status: { not: 'canceled' }
            }
          },
          select: {
            quantity: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { stock: 'asc' }
    })

    return products.map((product) => {
      const lastSale = product.orderItems[0]
      const daysSinceLastSale = lastSale
        ? Math.floor((new Date().getTime() - lastSale.createdAt.getTime()) / (1000 * 60 * 60 * 24))
        : null

      return {
        "Product ID": product.id,
        "Name": product.name,
        "SKU": product.sku || "N/A",
        "Category": product.category?.name || "N/A",
        "Current Stock": product.stock,
        "Price": Number(product.price),
        "Status": product.status,
        "Last Sale Date": lastSale ? format(lastSale.createdAt, "yyyy-MM-dd") : "Never",
        "Days Since Last Sale": daysSinceLastSale || "N/A",
        "Stock Status": product.stock === 0 ? "Out of Stock" : product.stock < 10 ? "Low Stock" : "In Stock",
        "Created At": format(product.createdAt, "yyyy-MM-dd HH:mm:ss"),
        "Updated At": format(product.updatedAt, "yyyy-MM-dd HH:mm:ss")
      }
    })
  }

  static async exportLowStock(filters?: any) {
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { stock: 0 },
          { stock: { lt: 10 } }
        ],
        ...filters
      },
      select: {
        id: true,
        name: true,
        sku: true,
        price: true,
        stock: true,
        status: true,
        category: {
          select: {
            name: true
          }
        },
        orderItems: {
          where: {
            order: {
              status: { not: 'canceled' }
            },
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          },
          select: {
            quantity: true,
            createdAt: true
          }
        }
      },
      orderBy: { stock: 'asc' }
    })

    return products.map((product) => {
      const recentSales = product.orderItems.reduce((sum, item) => sum + item.quantity, 0)
      const avgDailySales = recentSales / 30
      const daysUntilOutOfStock = avgDailySales > 0 && product.stock > 0
        ? Math.floor(product.stock / avgDailySales)
        : 0

      return {
        "Product ID": product.id,
        "Name": product.name,
        "SKU": product.sku || "N/A",
        "Category": product.category?.name || "N/A",
        "Current Stock": product.stock,
        "Price": product.price,
        "Status": product.status,
        "Recent Sales (30 days)": recentSales,
        "Avg Daily Sales": Number(avgDailySales.toFixed(2)),
        "Days Until Out of Stock": daysUntilOutOfStock,
        "Priority": product.stock === 0 ? "URGENT" : daysUntilOutOfStock < 7 ? "HIGH" : daysUntilOutOfStock < 30 ? "MEDIUM" : "LOW"
      }
    })
  }

  static async exportRevenue(filters?: any) {
    const { startDate, endDate } = filters || {}
    const orders = await prisma.order.findMany({
      where: {
        status: { not: 'canceled' },
        ...(startDate && { createdAt: { gte: new Date(startDate) } }),
        ...(endDate && { createdAt: { lte: new Date(endDate) } })
      },
      select: {
        createdAt: true,
        totalAmount: true,
        subtotal: true,
        shipping: true,
        tax: true,
        status: true,
        paymentStatus: true,
        orderItems: {
          select: {
            quantity: true,
            totalPrice: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    // Group by date
    const revenueByDate = new Map<string, any>()

    orders.forEach(order => {
      const date = format(order.createdAt, 'yyyy-MM-dd')

      if (!revenueByDate.has(date)) {
        revenueByDate.set(date, {
          Date: date,
          "Orders Count": 0,
          "Gross Revenue": 0,
          "Shipping Revenue": 0,
          "Tax Revenue": 0,
          "Net Revenue": 0,
          "Average Order Value": 0,
          "Items Sold": 0
        })
      }

      const dayData = revenueByDate.get(date)!
      dayData["Orders Count"] += 1
      dayData["Gross Revenue"] += Number(order.subtotal)
      dayData["Shipping Revenue"] += Number(order.shipping || 0)
      dayData["Tax Revenue"] += Number(order.tax || 0)
      dayData["Net Revenue"] += Number(order.totalAmount)
      dayData["Items Sold"] += order.orderItems.reduce((sum, item) => sum + item.quantity, 0)
    })

    // Calculate AOV for each day
    revenueByDate.forEach(dayData => {
      dayData["Average Order Value"] = dayData["Orders Count"] > 0
        ? dayData["Net Revenue"] / dayData["Orders Count"]
        : 0
    })

    return Array.from(revenueByDate.values())
  }

  static convertToCSV(data: any[], filename: string) {
    if (data.length === 0) return ""

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header]
            // Escape commas and quotes in CSV
            if (typeof value === "string" && (value.includes(",") || value.includes("\""))) {
              return `"${value.replace(/"/g, '""')}"`
            }
            return value
          })
          .join(","),
      ),
    ].join("\n")

    return csvContent
  }
}
