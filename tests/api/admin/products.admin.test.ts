import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST, PATCH, DELETE } from '@/app/api/admin/products/route'

beforeEach(() => {
  vi.resetModules()
})

// Mock admin authentication
vi.mock('@/lib/admin-auth', () => ({
  requireAdmin: vi.fn(async () => ({
    userId: 'admin123',
    role: 'ADMIN'
  }))
}))

vi.mock('@/lib/prisma', () => {
  const mockProducts = [
    {
      id: 'prod1',
      name: 'Product 1',
      slug: 'product-1',
      price: 100,
      stock: 10,
      status: 'ACTIVE'
    }
  ]

  const prisma = {
    product: {
      findMany: vi.fn(async () => mockProducts),
      findUnique: vi.fn(async ({ where }: any) => 
        mockProducts.find(p => p.id === where.id) || null
      ),
      create: vi.fn(async ({ data }: any) => ({
        id: 'newprod',
        ...data,
        createdAt: new Date()
      })),
      update: vi.fn(async ({ where, data }: any) => ({
        id: where.id,
        ...data
      })),
      delete: vi.fn(async ({ where }: any) => ({
        id: where.id
      })),
      count: vi.fn(async () => mockProducts.length)
    }
  }
  return { default: prisma, prisma }
})

function buildRequest(method: string, body?: any): Request {
  return new Request('https://example.com/api/admin/products', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  })
}

describe('Admin Products API', () => {
  describe('GET - List Products', () => {
    it('returns all products for admin', async () => {
      const req = buildRequest('GET')
      const res = await GET(req)
      expect(res.status).toBe(200)
      const json = await res.json()
      expect(Array.isArray(json.products)).toBe(true)
    })

    it('includes product metadata', async () => {
      const req = buildRequest('GET')
      const res = await GET(req)
      const json = await res.json()
      expect(json.total).toBeDefined()
      expect(json.page).toBeDefined()
    })
  })

  describe('POST - Create Product', () => {
    it('creates new product', async () => {
      const req = buildRequest('POST', {
        name: 'New Product',
        slug: 'new-product',
        price: 150,
        description: 'A new product',
        category: 'Electronics',
        stock: 20,
        images: ['image.jpg']
      })
      const res = await POST(req)
      expect(res.status).toBe(201)
      const json = await res.json()
      expect(json.product.id).toBe('newprod')
    })

    it('validates required fields', async () => {
      const req = buildRequest('POST', {
        name: 'Product'
      })
      const res = await POST(req)
      expect(res.status).toBe(400)
    })

    it('validates price is positive', async () => {
      const req = buildRequest('POST', {
        name: 'Product',
        slug: 'product',
        price: -10,
        stock: 10
      })
      const res = await POST(req)
      expect(res.status).toBe(400)
    })

    it('validates unique slug', async () => {
      const { default: prisma } = await import('@/lib/prisma') as any
      prisma.product.findUnique.mockResolvedValueOnce({ id: 'existing' })

      const req = buildRequest('POST', {
        name: 'Product',
        slug: 'existing-slug',
        price: 100,
        stock: 10
      })
      const res = await POST(req)
      expect(res.status).toBe(409)
    })
  })

  describe('PATCH - Update Product', () => {
    it('updates product', async () => {
      const req = buildRequest('PATCH', {
        id: 'prod1',
        price: 120,
        stock: 15
      })
      const res = await PATCH(req)
      expect(res.status).toBe(200)
    })

    it('validates product exists', async () => {
      const req = buildRequest('PATCH', {
        id: 'nonexistent',
        price: 100
      })
      const res = await PATCH(req)
      expect(res.status).toBe(404)
    })
  })

  describe('DELETE - Remove Product', () => {
    it('deletes product', async () => {
      const req = buildRequest('DELETE', { id: 'prod1' })
      const res = await DELETE(req)
      expect(res.status).toBe(200)
    })

    it('prevents deletion of product with active orders', async () => {
      const { default: prisma } = await import('@/lib/prisma') as any
      prisma.orderItem = {
        findFirst: vi.fn(async () => ({ id: 'item1' }))
      }

      const req = buildRequest('DELETE', { id: 'prod1' })
      const res = await DELETE(req)
      expect(res.status).toBe(400)
    })
  })

  describe('Authorization', () => {
    it('requires admin role', async () => {
      const { requireAdmin } = await import('@/lib/admin-auth') as any
      requireAdmin.mockRejectedValueOnce(new Error('Unauthorized'))

      const req = buildRequest('GET')
      const res = await GET(req)
      expect(res.status).toBe(401)
    })
  })
})
