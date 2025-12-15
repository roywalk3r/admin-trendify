import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST, PATCH, DELETE } from '@/app/api/admin/products/route'

const baseProducts = [
  {
    id: 'prod1',
    name: 'Product 1',
    slug: 'product-1',
    price: 100,
    stock: 10,
    status: 'ACTIVE',
    description: 'Default product',
    categoryId: 'cat1',
    variants: [],
  },
]

let mockProducts = [...baseProducts]
const requireAdminMock = vi.fn(async () => ({
  userId: 'admin123',
  role: 'ADMIN',
  error: false,
}))

beforeEach(() => {
  mockProducts = [...baseProducts]
  requireAdminMock.mockReset()
  requireAdminMock.mockResolvedValue({
    userId: 'admin123',
    role: 'ADMIN',
    error: false,
  })
})

// Mock admin authentication
vi.mock('@/lib/middleware/admin-auth', () => ({
  requireAdmin: requireAdminMock,
}))

vi.mock('@/lib/data/products', () => ({
  getProductsListCached: vi.fn(async () => ({
    products: mockProducts,
    total: mockProducts.length,
    page: 1,
    limit: mockProducts.length,
  })),
  invalidateProduct: vi.fn(),
  invalidateProductLists: vi.fn(),
}))

vi.mock('@/lib/prisma', () => {
  const prisma = {
    product: {
      findMany: vi.fn(async () => mockProducts),
      findUnique: vi.fn(async ({ where }: any) => {
        if (where?.id) return mockProducts.find((p) => p.id === where.id) || null
        if (where?.slug) return mockProducts.find((p) => p.slug === where.slug) || null
        return null
      }),
      findFirst: vi.fn(async ({ where }: any) => {
        if (where?.slug) return mockProducts.find((p) => p.slug === where.slug) || null
        return null
      }),
      create: vi.fn(async ({ data }: any) => {
        const created = { id: 'newprod', ...data, createdAt: new Date() }
        mockProducts.push(created)
        return created
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const idx = mockProducts.findIndex((p) => p.id === where.id)
        if (idx === -1) return null
        mockProducts[idx] = { ...mockProducts[idx], ...data }
        return mockProducts[idx]
      }),
      updateMany: vi.fn(async ({ where, data }: any) => {
        const ids = where?.id?.in || []
        let count = 0
        mockProducts = mockProducts.map((p) => {
          if (!ids.length || ids.includes(p.id)) {
            count++
            return { ...p, ...data }
          }
          return p
        })
        return { count }
      }),
      delete: vi.fn(async ({ where }: any) => {
        const product = mockProducts.find((p) => p.id === where.id) || null
        mockProducts = mockProducts.filter((p) => p.id !== where.id)
        return product
      }),
      count: vi.fn(async () => mockProducts.length),
    },
    productVariant: {
      updateMany: vi.fn(async () => ({})),
      create: vi.fn(async ({ data }: any) => data),
    },
    orderItem: {
      findFirst: vi.fn(async () => null),
    },
    $transaction: vi.fn(async (fn: any) => fn(prisma)),
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
        price: 150,
        description: 'A new product',
        categoryId: 'cat1',
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
        description: 'Test product',
        categoryId: 'cat1',
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
        stock: 10,
        description: 'Product',
        categoryId: 'cat1'
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
        stock: 15,
        name: 'Product 1',
        description: 'Updated product',
        categoryId: 'cat1'
      })
      const res = await PATCH(req)
      expect(res.status).toBe(200)
    })

    it('validates product exists', async () => {
      const req = buildRequest('PATCH', {
        id: 'nonexistent',
        price: 100,
        stock: 1,
        name: 'Missing',
        description: 'Missing',
        categoryId: 'cat1'
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
      const { requireAdmin } = await import('@/lib/middleware/admin-auth') as any
      requireAdmin.mockResolvedValueOnce({
        error: true,
        response: new Response('Unauthorized', { status: 401 }),
      })

      const req = buildRequest('GET')
      const res = await GET(req)
      expect(res.status).toBe(401)
    })
  })
})
