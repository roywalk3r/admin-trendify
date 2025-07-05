import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { redis } from "@/lib/redis"

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    const { productId, timestamp } = await request.json()

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    // Store in Redis for quick access
    // Format: user:views:{userId} -> sorted set of product IDs with timestamp as score
    if (userId) {
      await redis.zadd(`user:views:${userId}`, Date.now(), productId)

      // Keep only the last 50 viewed products
      await redis.zremrangebyrank(`user:views:${userId}`, 0, -51)
    }

    // Also track in a global sorted set for trending products
    await redis.zincrby("trending:products", 1, productId)

    // Expire trending data after 7 days
    await redis.expire("trending:products", 60 * 60 * 24 * 7)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error tracking product view:", error)
    return NextResponse.json({ error: "Failed to track product view" }, { status: 500 })
  }
}
