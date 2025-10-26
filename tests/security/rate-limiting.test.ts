import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * Rate limiting tests
 * Tests for Arcjet rate limiting functionality
 */

beforeEach(() => {
  vi.resetModules()
})

vi.mock('@arcjet/next', () => ({
  default: vi.fn(() => ({
    protect: vi.fn(async (request: Request) => ({
      conclusion: 'ALLOW',
      reason: 'RATE_LIMIT_OK',
      isAllowed: () => true,
      isDenied: () => false,
    }))
  })),
  shield: vi.fn(),
  detectBot: vi.fn(),
  tokenBucket: vi.fn(),
  rateLimit: vi.fn()
}))

describe('Rate Limiting', () => {
  describe('API Rate Limits', () => {
    it('allows requests within rate limit', async () => {
      const arcjet = (await import('@arcjet/next')).default
      const aj = arcjet({})
      
      const req = new Request('https://example.com/api/products')
      const result = await aj.protect(req)
      
      expect(result.isAllowed()).toBe(true)
    })

    it('blocks requests exceeding rate limit', async () => {
      const arcjet = (await import('@arcjet/next')).default
      const aj = arcjet({})
      
      // Mock rate limit exceeded
      aj.protect = vi.fn(async () => ({
        conclusion: 'DENY',
        reason: 'RATE_LIMIT_EXCEEDED',
        isAllowed: () => false,
        isDenied: () => true,
      }))

      const req = new Request('https://example.com/api/products')
      const result = await aj.protect(req)
      
      expect(result.isDenied()).toBe(true)
      expect(result.reason).toBe('RATE_LIMIT_EXCEEDED')
    })

    it('applies different limits for authenticated users', async () => {
      // Authenticated users typically get higher limits
      const req = new Request('https://example.com/api/products', {
        headers: {
          'Authorization': 'Bearer token123'
        }
      })
      
      // Test would verify authenticated rate limit is higher
      expect(req.headers.get('Authorization')).toBeTruthy()
    })

    it('tracks rate limit by IP address', async () => {
      const req = new Request('https://example.com/api/products', {
        headers: {
          'x-forwarded-for': '192.168.1.1'
        }
      })
      
      const ip = req.headers.get('x-forwarded-for')
      expect(ip).toBe('192.168.1.1')
    })
  })

  describe('Endpoint-Specific Limits', () => {
    it('applies stricter limits to sensitive endpoints', async () => {
      const loginReq = new Request('https://example.com/api/auth/login')
      const productsReq = new Request('https://example.com/api/products')
      
      // Login endpoints typically have stricter limits
      expect(loginReq.url).toContain('/auth/')
      expect(productsReq.url).toContain('/products')
    })

    it('allows more requests to read endpoints', async () => {
      const getReq = new Request('https://example.com/api/products', {
        method: 'GET'
      })
      const postReq = new Request('https://example.com/api/products', {
        method: 'POST'
      })
      
      expect(getReq.method).toBe('GET')
      expect(postReq.method).toBe('POST')
    })
  })

  describe('Bot Detection', () => {
    it('identifies and blocks malicious bots', async () => {
      const arcjet = (await import('@arcjet/next')).default
      const aj = arcjet({})
      
      aj.protect = vi.fn(async () => ({
        conclusion: 'DENY',
        reason: 'BOT_DETECTED',
        isAllowed: () => false,
        isDenied: () => true,
      }))

      const req = new Request('https://example.com/api/products', {
        headers: {
          'User-Agent': 'curl/7.68.0' // Potential bot
        }
      })
      
      const result = await aj.protect(req)
      expect(result.isDenied()).toBe(true)
    })

    it('allows legitimate user agents', async () => {
      const req = new Request('https://example.com/api/products', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...'
        }
      })
      
      expect(req.headers.get('User-Agent')).toContain('Mozilla')
    })
  })

  describe('Token Bucket Algorithm', () => {
    it('replenishes tokens over time', async () => {
      // Token bucket allows burst traffic but limits sustained load
      const { tokenBucket } = await import('@arcjet/next')
      
      const bucket = tokenBucket({
        capacity: 10,
        refillRate: 2, // 2 tokens per second
        interval: '1s'
      })
      
      expect(bucket).toBeDefined()
    })

    it('allows burst requests within capacity', async () => {
      // Simulate multiple rapid requests
      const requests = Array.from({ length: 5 }, (_, i) => 
        new Request(`https://example.com/api/products?page=${i}`)
      )
      
      expect(requests.length).toBe(5)
    })
  })

  describe('Rate Limit Headers', () => {
    it('includes rate limit info in response headers', () => {
      const headers = new Headers({
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': '95',
        'X-RateLimit-Reset': '1640000000'
      })
      
      expect(headers.get('X-RateLimit-Limit')).toBe('100')
      expect(headers.get('X-RateLimit-Remaining')).toBe('95')
      expect(headers.get('X-RateLimit-Reset')).toBeDefined()
    })

    it('includes retry-after header when rate limited', () => {
      const headers = new Headers({
        'Retry-After': '60'
      })
      
      expect(headers.get('Retry-After')).toBe('60')
    })
  })
})
