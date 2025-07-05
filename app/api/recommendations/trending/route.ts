import { NextResponse } from "next/server"
import { redis } from "@/lib/redis"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10", 10)

    // Get trending product IDs from Redis
    const trendingProductIds = await redis.zrevrange("trending:products", 0, limit - 1)

    if (!trendingProductIds.length) {
      // Fallback to recent products if no trending data
      const recentProducts = await prisma.product.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        include: { category: true },
      })

      return NextResponse.json({ products: recentProducts })
    }

    // Fetch full product details from database
    const products = await prisma.product.findMany({
      where: {
        id: { in: trendingProductIds },
      },
      include: { category: true },
    })

    // Sort products in the same order as the trending IDs
    const sortedProducts = trendingProductIds.map((id) => products.find((product) => product.id === id)).filter(Boolean)

    return NextResponse.json({ products: sortedProducts })
  } catch (error) {
    console.error("Error fetching trending products:", error)
    return NextResponse.json({ error: "Failed to fetch trending products" }, { status: 500 })
  }
}
