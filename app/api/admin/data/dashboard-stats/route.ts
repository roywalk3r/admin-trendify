import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { createApiResponse } from "@/lib/api-utils";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Get comprehensive dashboard statistics
    const [
      totalProducts,
      activeProducts,
      lowStockProducts,
      totalOrders,
      recentOrders,
      pendingOrders,
      totalCustomers,
      activeCustomers,
      totalReviews,
      pendingReviews,
      totalRevenue,
      monthlyRevenue,
      topSellingProducts,
      categoryStats,
    ] = await Promise.all([
      // Product stats
      prisma.product.count({
        where: { isDeleted: false },
      }),
      prisma.product.count({
        where: { isActive: true, isDeleted: false },
      }),
      prisma.product.findMany({
        where: {
          stock: {
            lte: prisma.product.fields.lowStockAlert,
          },
          isActive: true,
          isDeleted: false,
        },
        select: {
          id: true,
          name: true,
          stock: true,
          lowStockAlert: true,
          category: {
            select: { name: true },
          },
        },
        take: 20,
      }),

      // Order stats
      prisma.order.count(),
      prisma.order.count({
        where: {
          createdAt: { gte: startOfWeek },
        },
      }),
      prisma.order.count({
        where: {
          status: "pending",
        },
      }),

      // Customer stats
      prisma.user.count({
        where: { role: "customer" },
      }),
      prisma.user.count({
        where: {
          role: "customer",
          lastLoginAt: { gte: startOfMonth },
        },
      }),

      // Review stats
      prisma.review.count(),
      prisma.review.count({
        where: { isApproved: false },
      }),

      // Revenue stats
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { not: "canceled" } },
      }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          status: { not: "canceled" },
          createdAt: { gte: startOfMonth },
        },
      }),

      // Top selling products
      prisma.product.findMany({
        where: {
          isActive: true,
          isDeleted: false,
        },
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
          category: {
            select: { name: true },
          },
          orderItems: {
            select: {
              quantity: true,
              totalPrice: true,
            },
          },
        },
        take: 50,
      }),

      // Category statistics
      prisma.category.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          products: {
            where: {
              isActive: true,
              isDeleted: false,
            },
            select: {
              id: true,
              orderItems: {
                select: {
                  quantity: true,
                  totalPrice: true,
                },
              },
            },
          },
        },
      }),
    ]);

    // Process top selling products
    const topSellingWithSales = topSellingProducts
      .map(product => {
        const totalSales = product.orderItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalRevenue = product.orderItems.reduce((sum, item) => sum + Number(item.totalPrice), 0);
        return {
          id: product.id,
          name: product.name,
          price: Number(product.price),
          stock: product.stock,
          category: product.category.name,
          sales: totalSales,
          revenue: totalRevenue,
        };
      })
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10);

    // Process category statistics
    const categoryStatsProcessed = categoryStats.map(category => {
      const totalProducts = category.products.length;
      const totalSales = category.products.reduce((sum, product) => 
        sum + product.orderItems.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
      );
      const totalRevenue = category.products.reduce((sum, product) => 
        sum + product.orderItems.reduce((itemSum, item) => itemSum + Number(item.totalPrice), 0), 0
      );
      
      return {
        id: category.id,
        name: category.name,
        productCount: totalProducts,
        sales: totalSales,
        revenue: totalRevenue,
      };
    }).sort((a, b) => b.revenue - a.revenue);

    // Calculate growth rates (simplified - in real app you'd compare with previous periods)
    const growthRates = {
      orders: recentOrders > 0 ? ((recentOrders / totalOrders) * 100).toFixed(1) : "0",
      revenue: monthlyRevenue._sum.totalAmount && totalRevenue._sum.totalAmount 
        ? ((Number(monthlyRevenue._sum.totalAmount) / Number(totalRevenue._sum.totalAmount)) * 100).toFixed(1) 
        : "0",
      customers: activeCustomers > 0 ? ((activeCustomers / totalCustomers) * 100).toFixed(1) : "0",
    };

    return createApiResponse({
      data: {
        overview: {
          totalProducts,
          activeProducts,
          lowStockCount: lowStockProducts.length,
          totalOrders,
          recentOrders,
          pendingOrders,
          totalCustomers,
          activeCustomers,
          totalReviews,
          pendingReviews,
          totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
          monthlyRevenue: Number(monthlyRevenue._sum.totalAmount || 0),
        },
        lowStockProducts,
        topSellingProducts: topSellingWithSales,
        categoryStats: categoryStatsProcessed,
        growthRates,
        lastUpdated: new Date().toISOString(),
      },
      status: 200,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return createApiResponse({
      error: "Failed to fetch dashboard statistics",
      status: 500,
    });
  }
}
