import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST, DELETE } from '@/app/api/cart/route'
import { PATCH } from '@/app/api/cart/[itemId]/route'

beforeEach(() => {
  vi.resetModules()
})

// Mock Prisma
vi.mock('@/lib/prisma', () => {
  const mockCartItems = [
    {
      id: 'item1',
      cartId: 'cart123',
      productId: 'prod1',
      quantity: 2,
      product: {
        id: 'prod1',
        name: 'Test Product',
        price: 100,
        stock: 10,
        images: ['image1.jpg'],
        slug: 'test-product'
      }
    }
  ]

  const prisma = {
    cart: {
      findFirst: vi.fn(async ({ where }: any) => {
        if (where.sessionId || where.userId) {
          return {
            id: 'cart123',
            userId: where.userId,
            sessionId: where.sessionId,
            items: mockCartItems
          }
        }
        return null
      }),
      create: vi.fn(async ({ data }: any) => ({
        id: 'newcart',
        ...data,
        items: []
      })),
      update: vi.fn(async ({ where, data }: any) => ({
        id: where.id,
        ...data
      }))
    },
    cartItem: {
      findFirst: vi.fn(async ({ where }: any) => {
        if (where.productId === 'prod1') return mockCartItems[0]
        return null
      }),
      create: vi.fn(async ({ data }: any) => ({
        id: 'newitem',
        ...data
      })),
      update: vi.fn(async ({ where, data }: any) => ({
        id: where.id,
        ...data
      })),
      delete: vi.fn(async ({ where }: any) => ({
        id: where.id
      }))
    },
    product: {
      findUnique: vi.fn(async ({ where }: any) => {
        if (where.id === 'prod1' || where.id === 'prod2') {
          return {
            id: where.id,
            name: 'Test Product',
            price: 100,
            stock: 10,
            images: ['image1.jpg']
          }
        }
        return null
      })
    }
  }
  return { default: prisma, prisma }
})

function buildRequest(method: string, body?: any): Request {
  return new Request('https://example.com/api/cart', {
    method,
    headers: { 
      'Content-Type': 'application/json',
      'x-session-id': 'session123'
    },
    body: body ? JSON.stringify(body) : undefined
  })
}

describe('Cart API - GET', () => {
  it('returns empty cart for new session', async () => {
    const req = buildRequest('GET')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.cart).toBeDefined()
  })

  it('returns cart with items', async () => {
    const req = buildRequest('GET')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.cart.items).toBeDefined()
  })
})

describe('Cart API - POST (Add to Cart)', () => {
  it('adds item to cart successfully', async () => {
    const req = buildRequest('POST', { 
      productId: 'prod2', 
      quantity: 1 
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
  })

  it('validates required fields', async () => {
    const req = buildRequest('POST', {})
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('validates quantity is positive', async () => {
    const req = buildRequest('POST', { 
      productId: 'prod1', 
      quantity: -1 
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})

describe('Cart API - DELETE (Remove from Cart)', () => {
  it('removes item from cart', async () => {
    const req = buildRequest('DELETE', { itemId: 'item1' })
    const res = await DELETE(req)
    expect(res.status).toBe(200)
  })
})

describe('Cart API - PATCH (Update Quantity)', () => {
  it('updates item quantity', async () => {
    const req = buildRequest('PATCH', { quantity: 3 })
    const res = await PATCH(req, { params: { itemId: 'item1' } })
    expect(res.status).toBe(200)
  })

  it('validates quantity is positive', async () => {
    const req = buildRequest('PATCH', { quantity: 0 })
    const res = await PATCH(req, { params: { itemId: 'item1' } })
    expect(res.status).toBe(400)
  })
})
