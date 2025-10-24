import { redis } from "./redis"

/**
 * Cache configuration for different data types
 */
export const CACHE_TTL = {
  PRODUCTS: 60 * 5, // 5 minutes
  CATEGORIES: 60 * 15, // 15 minutes
  ORDERS: 60 * 2, // 2 minutes
  STATS: 60 * 10, // 10 minutes
  USER_SESSION: 60 * 30, // 30 minutes
} as const

/**
 * Generate cache key with namespace
 */
export function getCacheKey(namespace: string, ...parts: string[]): string {
  return `cache:${namespace}:${parts.join(":")}`
}

/**
 * Wrapper for cached API calls with automatic invalidation
 */
export async function withCache<T>(
  key: string,
  ttl: number,
  fetcher: () => Promise<T>
): Promise<T> {
  try {
    // Try to get from cache
    const cached = await redis.get(key)
    if (cached) {
      return JSON.parse(cached) as T
    }
  } catch (error) {
    console.error("Cache get error:", error)
  }

  // Fetch fresh data
  const data = await fetcher()

  // Store in cache (fire and forget)
  try {
    await redis.setex(key, ttl, JSON.stringify(data))
  } catch (error) {
    console.error("Cache set error:", error)
  }

  return data
}

/**
 * Invalidate cache by pattern
 */
export async function invalidateCache(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  } catch (error) {
    console.error("Cache invalidation error:", error)
  }
}

/**
 * Cache tags for grouped invalidation
 */
export const CACHE_TAGS = {
  PRODUCTS: "products",
  ORDERS: "orders",
  USERS: "users",
  REVIEWS: "reviews",
  COUPONS: "coupons",
} as const

/**
 * Invalidate all caches with a specific tag
 */
export async function invalidateCacheTag(tag: string): Promise<void> {
  await invalidateCache(`cache:${tag}:*`)
}
