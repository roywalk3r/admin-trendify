type CacheItem<T> = {
  data: T
  expiry: number
}

class ApiCache {
  private cache: Map<string, CacheItem<any>> = new Map()

  /**
   * Get data from cache
   * @param key Cache key
   * @returns Cached data or undefined if not found or expired
   */
  get<T>(key: string): T | undefined {
    const item = this.cache.get(key)

    if (!item) {
      return undefined
    }

    // Check if cache has expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return undefined
    }

    return item.data as T
  }

  /**
   * Set data in cache
   * @param key Cache key
   * @param data Data to cache
   * @param ttl Time to live in milliseconds (default: 5 minutes)
   */
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl,
    })
  }

  /**
   * Remove item from cache
   * @param key Cache key
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get all cache keys
   * @returns Array of cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  /**
   * Get cache size
   * @returns Number of items in cache
   */
  size(): number {
    return this.cache.size
  }
}

// Create singleton instance
export const apiCache = new ApiCache()

/**
 * Wrapper for fetch with caching
 * @param url URL to fetch
 * @param options Fetch options
 * @param ttl Cache TTL in milliseconds
 * @returns Response data
 */
export async function fetchWithCache<T>(url: string, options?: RequestInit, ttl?: number): Promise<T> {
  // Only cache GET requests
  const shouldCache = !options || options.method === undefined || options.method === "GET"

  if (shouldCache) {
    const cacheKey = `${url}:${JSON.stringify(options)}`
    const cachedData = apiCache.get<T>(cacheKey)

    if (cachedData) {
      return cachedData
    }

    const response = await fetch(url, options)
    const data = await response.json()

    if (response.ok) {
      apiCache.set(cacheKey, data, ttl)
    }

    return data
  }

  // Non-GET requests are not cached
  const response = await fetch(url, options)
  const data = await response.json()
  return data
}
