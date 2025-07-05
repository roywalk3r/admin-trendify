import { Redis } from "@upstash/redis"

// Initialize Redis client with environment variables
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
})

// Cache helper functions
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get<T>(key)
    return data
  } catch (error) {
    console.error("Redis get error:", error)
    return null
  }
}

export async function setCache<T>(key: string, data: T, expireInSeconds?: number): Promise<void> {
  try {
    if (expireInSeconds) {
      await redis.set(key, data, { ex: expireInSeconds })
    } else {
      await redis.set(key, data)
    }
  } catch (error) {
    console.error("Redis set error:", error)
  }
}

export async function deleteCache(key: string): Promise<void> {
  try {
    await redis.del(key)
  } catch (error) {
    console.error("Redis delete error:", error)
  }
}

// Rate limiting helper
export async function rateLimit(
  ip: string,
  limit = 10,
  windowInSeconds = 60,
): Promise<{ success: boolean; remaining: number }> {
  const key = `rate-limit:${ip}`

  try {
    // Get current count
    const count = (await redis.get<number>(key)) || 0

    if (count >= limit) {
      return { success: false, remaining: 0 }
    }

    // Increment count
    const newCount = await redis.incr(key)

    // Set expiry if this is the first request in the window
    if (newCount === 1) {
      await redis.expire(key, windowInSeconds)
    }

    return { success: true, remaining: limit - newCount }
  } catch (error) {
    console.error("Rate limit error:", error)
    // Allow the request if Redis fails
    return { success: true, remaining: 1 }
  }
}
