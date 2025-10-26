import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '@/app/api/products/route'
import { GET as GetProduct } from '@/app/api/products/[slug]/route'

beforeEach(() => {
  vi.resetModules()
})

vi.mock('@/lib/prisma', () => {
  const mockProducts = [
    {
      id: 'prod1',
      name: 'Test Product 1',
      slug: 'test-product-1',
      price: 100,
      description: 'Test description',
      category: 'Electronics',
      images: ['image1.jpg'],
      stock: 10,
      rating: 4.5,
      reviewCount: 10,
      createdAt: new Date()
    },
    {
      id: 'prod2',
      name: 'Test Product 2',
      slug: 'test-product-2',
      price: 200,
      description: 'Test description 2',
      category: 'Fashion',
      images: ['image2.jpg'],
      stock: 5,
      rating: 4.0,
      reviewCount: 5,
      createdAt: new Date()
    }
  ]

  const prisma = {
    product: {
      findMany: vi.fn(async ({ where, orderBy, take, skip }: any) => {
        let filtered = [...mockProducts]
        
        if (where?.category) {
          filtered = filtered.filter(p => p.category === where.category)
        }
        
        if (where?.name?.contains) {
          filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(where.name.contains.toLowerCase())
          )
        }

        if (take) {
          filtered = filtered.slice(skip || 0, (skip || 0) + take)
        }

        return filtered
      }),
      findUnique: vi.fn(async ({ where }: any) => {
        return mockProducts.find(p => 
          p.id === where.id || p.slug === where.slug
        ) || null
      }),
      count: vi.fn(async () => mockProducts.length)
    },
    category: {
      findMany: vi.fn(async () => [
        { id: '1', name: 'Electronics', slug: 'electronics' },
        { id: '2', name: 'Fashion', slug: 'fashion' }
      ])
    }
  }
  return { default: prisma, prisma }
})

function buildRequest(searchParams?: Record<string, string>): Request {
  const url = new URL('https://example.com/api/products')
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
  }
  return new Request(url.toString())
}

describe('Products API - GET /api/products', () => {
  it('returns all products', async () => {
    const req = buildRequest()
    const res = await GET(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(Array.isArray(json.products)).toBe(true)
    expect(json.products.length).toBeGreaterThan(0)
  })

  it('filters products by category', async () => {
    const req = buildRequest({ category: 'Electronics' })
    const res = await GET(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.products.every((p: any) => p.category === 'Electronics')).toBe(true)
  })

  it('searches products by name', async () => {
    const req = buildRequest({ search: 'Test' })
    const res = await GET(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(Array.isArray(json.products)).toBe(true)
  })

  it('handles pagination', async () => {
    const req = buildRequest({ page: '1', limit: '1' })
    const res = await GET(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.products.length).toBeLessThanOrEqual(1)
  })

  it('filters by price range', async () => {
    const req = buildRequest({ minPrice: '50', maxPrice: '150' })
    const res = await GET(req)
    expect(res.status).toBe(200)
  })
})

describe('Products API - GET /api/products/[slug]', () => {
  it('returns product by slug', async () => {
    const req = buildRequest()
    const res = await GetProduct(req, { params: { slug: 'test-product-1' } })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.product.slug).toBe('test-product-1')
  })

  it('returns 404 for non-existent product', async () => {
    const req = buildRequest()
    const res = await GetProduct(req, { params: { slug: 'non-existent' } })
    expect(res.status).toBe(404)
  })
})
