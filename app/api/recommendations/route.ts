import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")
    const type = searchParams.get("type") || "similar" // similar, viewed, purchased
    const limit = Number.parseInt(searchParams.get("limit") || "4", 10)

    const { userId } = await auth()

    // If no product ID is provided and we have a user ID, get personalized recommendations
    if (!productId && userId) {
      return await getPersonalizedRecommendations(userId, limit)
    }

    // If product ID is provided, get similar products
    if (productId) {
      return await getSimilarProducts(productId, limit)
    }

    // Fallback to popular products
    return await getPopularProducts(limit)
  } catch (error) {
    console.error("Recommendation error:", error)
    return NextResponse.json({ error: "Failed to fetch recommendations" }, { status: 500 })
  }
}

async function getPersonalizedRecommendations(userId: string, limit: number) {
  // Get user's recent order items
  const recentOrders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: {
      orderItems: {
        include: {
          product: {
            select: { categoryId: true },
          },
        },
      },
    },
  })

  // Extract category IDs from recent purchases
  const categoryIds = new Set<string>()
  recentOrders.forEach((order) => {
    order.orderItems.forEach((item) => {
      if (item.product?.categoryId) {
        categoryIds.add(item.product.categoryId)
      }
    })
  })

  // Get products from the same categories
  const products = await prisma.product.findMany({
    where: {
      categoryId: {
        in: Array.from(categoryIds),
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      category: true,
    },
  })

  return NextResponse.json({ products })
}

async function getSimilarProducts(productId: string, limit: number) {
  // Get the product's category
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { categoryId: true },
  })

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }

  // Get similar products from the same category
  const similarProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: productId }, // Exclude the current product
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      category: true,
    },
  })

  return NextResponse.json({ products: similarProducts })
}

async function getPopularProducts(limit: number) {
  // Get products with the most orders
  const popularProducts = await prisma.product.findMany({
    orderBy: {
      orderItems: {
        _count: "desc",
      },
    },
    take: limit,
    include: {
      category: true,
    },
  })

  return NextResponse.json({ products: popularProducts })
}
