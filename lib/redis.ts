import Valkey from "ioredis";
/**
 * This module initializes a Redis client using Valkey and provides helper functions
 * for caching, rate limiting, and other Redis operations.
 */
// Initialize Redis client with environment variables
export const redis = new Valkey(process.env.VALKEY_URL || "");

// Cache helper functions
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key);
    if (!data) return null;

    try {
      return JSON.parse(data) as T;
    } catch (parseError) {
      console.error("Redis data parse error:", parseError);
      return data as T | null;
    }
  } catch (error) {
    console.error("Redis get error:", error);
    return null;
  }
}

export async function setCache<T>(
  key: string,
  data: T,
  expireInSeconds?: number
): Promise<void> {
  try {
    if (expireInSeconds) {
      await redis.setex(key, expireInSeconds, JSON.stringify(data));
    } else {
      await redis.set(key, JSON.stringify(data));
    }
  } catch (error) {
    console.error("Redis set error:", error);
  }
}

export async function deleteCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (error) {
    console.error("Redis delete error:", error);
  }
}

// Rate limiting helper
export async function rateLimit(
  ip: string,
  limit = 10,
  windowInSeconds = 60
): Promise<{ success: boolean; remaining: number }> {
  const key = `rate-limit:${ip}`;

  try {
    // Get current count
    const countRaw = await redis.get(key);
    const count = typeof countRaw === "string" ? parseInt(countRaw, 10) : (countRaw || 0);

    if (count >= limit) {
      return { success: false, remaining: 0 };
    }

    // Increment count
    const newCount = await redis.incr(key);

    // Set expiry if this is the first request in the window
    if (newCount === 1) {
      await redis.expire(key, windowInSeconds);
    }

    return { success: true, remaining: limit - newCount };
  } catch (error) {
    console.error("Rate limit error:", error);
    // Allow the request if Redis fails
    return { success: true, remaining: 1 };
  }
}
