import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from '@/app/api/reviews/route'

beforeEach(() => {
  vi.resetModules()
})

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(async () => ({ userId: 'user123' }))
}))

vi.mock('@/lib/prisma', () => {
  const mockReviews = [
    {
      id: 'rev1',
      productId: 'prod1',
      userId: 'user123',
      rating: 5,
      comment: 'Great product!',
      createdAt: new Date(),
      user: {
        id: 'user123',
        firstName: 'John',
        lastName: 'Doe',
        imageUrl: 'avatar.jpg'
      }
    }
  ]

  const prisma = {
    review: {
      findMany: vi.fn(async ({ where }: any) => {
        if (where?.productId) {
          return mockReviews.filter(r => r.productId === where.productId)
        }
        return mockReviews
      }),
      create: vi.fn(async ({ data }: any) => ({
        id: 'newrev',
        ...data,
        createdAt: new Date()
      })),
      findFirst: vi.fn(async ({ where }: any) => {
        return mockReviews.find(r => 
          r.productId === where.productId && r.userId === where.userId
        ) || null
      })
    },
    product: {
      findUnique: vi.fn(async ({ where }: any) => {
        if (where.id === 'prod1') {
          return { id: 'prod1', name: 'Test Product' }
        }
        return null
      }),
      update: vi.fn(async ({ where, data }: any) => ({
        id: where.id,
        ...data
      }))
    },
    order: {
      findFirst: vi.fn(async ({ where }: any) => {
        // Return order to verify user purchased product
        return {
          id: 'order1',
          userId: where.userId,
          items: [{ productId: where.items.some.orderItems.some.productId }]
        }
      })
    }
  }
  return { default: prisma, prisma }
})

function buildRequest(method: string, searchParams?: Record<string, string>, body?: any): Request {
  const url = new URL('https://example.com/api/reviews')
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
  }
  return new Request(url.toString(), {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  })
}

describe('Reviews API - GET', () => {
  it('returns reviews for a product', async () => {
    const req = buildRequest('GET', { productId: 'prod1' })
    const res = await GET(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(Array.isArray(json.reviews)).toBe(true)
  })

  it('requires productId', async () => {
    const req = buildRequest('GET')
    const res = await GET(req)
    expect(res.status).toBe(400)
  })
})

describe('Reviews API - POST', () => {
  it('creates a review', async () => {
    const req = buildRequest('POST', undefined, {
      productId: 'prod1',
      rating: 5,
      comment: 'Excellent product!'
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.review).toBeDefined()
  })

  it('validates rating range (1-5)', async () => {
    const req = buildRequest('POST', undefined, {
      productId: 'prod1',
      rating: 6,
      comment: 'Invalid rating'
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('requires authentication', async () => {
    const { auth } = await import('@clerk/nextjs/server') as any
    auth.mockResolvedValueOnce({ userId: null })
    
    const req = buildRequest('POST', undefined, {
      productId: 'prod1',
      rating: 5,
      comment: 'Great!'
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('validates required fields', async () => {
    const req = buildRequest('POST', undefined, {
      rating: 5
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})
