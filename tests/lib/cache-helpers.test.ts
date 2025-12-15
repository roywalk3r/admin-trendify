import { beforeEach, describe, expect, it, vi } from 'vitest'

const redisMock = vi.hoisted(() => ({
  get: vi.fn(),
  setex: vi.fn(),
  keys: vi.fn(),
  del: vi.fn(),
}))

vi.mock('@/lib/redis', () => ({
  redis: redisMock,
}))

import { getCacheKey, invalidateCache, invalidateCacheTag, withCache } from '@/lib/cache-helpers'

describe('cache-helpers', () => {
  const key = 'cache:test:key'

  beforeEach(() => {
    vi.clearAllMocks()
    redisMock.get.mockResolvedValue(null)
    redisMock.setex.mockResolvedValue('OK')
    redisMock.keys.mockResolvedValue([])
    redisMock.del.mockResolvedValue(0)
  })

  it('builds namespaced cache keys', () => {
    expect(getCacheKey('products', '123', 'reviews')).toBe('cache:products:123:reviews')
  })

  it('returns cached value without calling fetcher on hit', async () => {
    const cached = { value: 42 }
    redisMock.get.mockResolvedValueOnce(JSON.stringify(cached))
    const fetcher = vi.fn().mockResolvedValue({ value: 99 })

    const result = await withCache(key, 30, fetcher)

    expect(result).toEqual(cached)
    expect(fetcher).not.toHaveBeenCalled()
    expect(redisMock.setex).not.toHaveBeenCalled()
  })

  it('fetches and stores value on cache miss', async () => {
    const fresh = { id: 'new', name: 'Fresh data' }
    const fetcher = vi.fn().mockResolvedValue(fresh)

    const result = await withCache(key, 45, fetcher)

    expect(result).toEqual(fresh)
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(redisMock.setex).toHaveBeenCalledWith(key, 45, JSON.stringify(fresh))
  })

  it('falls back to fetcher when cache read fails and still tries to cache result', async () => {
    const error = new Error('redis down')
    redisMock.get.mockRejectedValueOnce(error)
    const fetcher = vi.fn().mockResolvedValue({ ok: true })
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const result = await withCache(key, 10, fetcher)

    expect(result).toEqual({ ok: true })
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(redisMock.setex).toHaveBeenCalledWith(key, 10, JSON.stringify({ ok: true }))
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('deletes all matching keys when invalidating cache', async () => {
    redisMock.keys.mockResolvedValueOnce(['cache:products:1', 'cache:products:2'])

    await invalidateCache('cache:products:*')

    expect(redisMock.keys).toHaveBeenCalledWith('cache:products:*')
    expect(redisMock.del).toHaveBeenCalledWith('cache:products:1', 'cache:products:2')
  })

  it('invalidates tagged cache namespace', async () => {
    await invalidateCacheTag('orders')

    expect(redisMock.keys).toHaveBeenCalledWith('cache:orders:*')
  })
})
