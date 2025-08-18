import { prisma } from "@/lib/prisma"

export class DataExporter {
  static async exportProducts(filters?: any) {
    const products = await prisma.product.findMany({
      where: {
        isDeleted: false,
        ...filters,
      },
      include: {
        category: true,
        reviews: true,
        orderItems: true,
      },
    })

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      price: product.price,
      stock: product.stock,
      category: product.category.name,
      status: product.status,
      featured: product.isFeatured,
      totalSales: product.orderItems.reduce((sum, item) => sum + item.quantity, 0),
      avgRating:
        product.reviews.length > 0
          ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
          : 0,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }))
  }

  static async exportOrders(filters?: any) {
    const orders = await prisma.order.findMany({
      where: filters,
      include: {
        user: true,
        orderItems: {
          include: {
            product: true,
          },
        },
        payment: true,
      },
    })

    return orders.map((order) => ({
      id: order.id,
      customerName: order.user.name,
      customerEmail: order.user.email,
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
      itemCount: order.orderItems.length,
      paymentMethod: order.payment?.method || "N/A",
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }))
  }

  static async exportUsers(filters?: any) {
    const users = await prisma.user.findMany({
      where: {
        deletedAt: null,
        ...filters,
      },
      include: {
        orders: true,
        reviews: true,
      },
    })

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      totalOrders: user.orders.length,
      totalSpent: user.orders.reduce((sum, order) => sum + Number(order.totalAmount), 0),
      reviewCount: user.reviews.length,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }))
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
            return typeof value === "string" && value.includes(",") ? `"${value}"` : value
          })
          .join(","),
      ),
    ].join("\n")

    return csvContent
  }
}
