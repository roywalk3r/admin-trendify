import type { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { adminAuthMiddleware } from "@/lib/admin-auth"

export async function GET(req: NextRequest) {
  const authResponse = await adminAuthMiddleware(req)
  if (authResponse.status !== 200) {
    return authResponse
  }

  try {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenueData,
      recentOrders,
      topProductsData,
      usersByRole,
      salesByMonth,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: {
          totalAmount: true,
        },
        where: { paymentStatus: "paid" },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
        },
      }),

      // Top selling products
      prisma.orderItem.groupBy({
        by: ["productId"],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),

      // Users by role
      prisma.user.groupBy({
        by: ["role"],
        _count: true,
      }),

      // Sales by month (last 6 months)
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', "created_at") as month,
          SUM("total_amount") as revenue,
          COUNT(*) as orders
        FROM orders
        WHERE "created_at" > NOW() - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', "created_at")
        ORDER BY month DESC
      `,
    ])

    // Extract productIds safely
    const productIds = topProductsData
      .map((item: any) => item.productId) // FIXED: Correct key casing
      .filter((id: string | undefined): id is string => typeof id === "string")

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    })

    const topProducts = topProductsData.map((item: any) => ({
      product: products.find((p) => p.id === item.productId),
      totalSold: item._sum.quantity,
    }))

    return createApiResponse({
      data: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenueData._sum.totalAmount || 0,
        recentOrders,
        topProducts,
        usersByRole,
        salesByMonth,
      },
      status: 200,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
