import Valkey from "ioredis";
import { logError, logDebug } from "./logger";

/**
 * This module initializes a Redis client using Valkey and provides helper functions
 * for caching, rate limiting, and other Redis operations.
 */
// Initialize Redis client with environment variables
export const redis = new Valkey(process.env.VALKEY_URL || "", {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

// Cache helper functions
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key);
    if (!data) return null;

    try {
      return JSON.parse(data) as T;
    } catch (parseError) {
      logError(parseError, { context: "Redis parse error", key });
      return data as T | null;
    }
  } catch (error) {
    logError(error, { context: "Redis get error", key });
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
    logDebug("Cache set", { key, expireInSeconds });
  } catch (error) {
    logError(error, { context: "Redis set error", key });
  }
}

export async function deleteCache(key: string): Promise<void> {
  try {
    await redis.del(key);
    logDebug("Cache deleted", { key });
  } catch (error) {
    logError(error, { context: "Redis delete error", key });
  }
}

// Delete multiple keys by pattern using SCAN to avoid blocking
export async function deleteByPattern(pattern: string): Promise<number> {
  try {
    let cursor = "0";
    let totalDeleted = 0;
    do {
      const [nextCursor, keys] = await (redis as any).scan(cursor, "MATCH", pattern, "COUNT", 500);
      cursor = nextCursor;
      if (keys && keys.length > 0) {
        const pipeline = redis.pipeline();
        for (const k of keys) pipeline.del(k);
        const results = await pipeline.exec();
        totalDeleted += results?.length || 0;
      }
    } while (cursor !== "0");
    logDebug("Pattern cache delete", { pattern, totalDeleted });
    return totalDeleted;
  } catch (error) {
    logError(error, { context: "Redis deleteByPattern error", pattern });
    return 0;
  }
}

// Rate limiting helper
export async function rateLimit(
  identifier: string,
  limit = 10,
  windowInSeconds = 60
): Promise<{ success: boolean; remaining: number }> {
  const key = `rate-limit:${identifier}`;

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
    logError(error, { context: "Rate limit error", identifier });
    // Allow the request if Redis fails (fail open for availability)
    return { success: true, remaining: 1 };
  }
}
