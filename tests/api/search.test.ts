import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '@/app/api/search/route'

beforeEach(() => {
  vi.resetModules()
})

vi.mock('@/lib/prisma', () => {
  const mockProducts = [
    {
      id: 'prod1',
      name: 'Nike Air Max',
      slug: 'nike-air-max',
      description: 'Premium running shoes',
      category: 'Shoes',
      price: 150,
      images: ['nike.jpg'],
      stock: 10,
      rating: 4.5
    },
    {
      id: 'prod2',
      name: 'Nike T-Shirt',
      slug: 'nike-t-shirt',
      description: 'Comfortable cotton t-shirt',
      category: 'Clothing',
      price: 30,
      images: ['tshirt.jpg'],
      stock: 20,
      rating: 4.0
    },
    {
      id: 'prod3',
      name: 'Adidas Running Shoes',
      slug: 'adidas-running-shoes',
      description: 'Lightweight running shoes',
      category: 'Shoes',
      price: 120,
      images: ['adidas.jpg'],
      stock: 5,
      rating: 4.7
    }
  ]

  const prisma = {
    product: {
      findMany: vi.fn(async ({ where, orderBy, take }: any) => {
        let results = [...mockProducts]

        // Text search
        if (where?.OR) {
          const searchTerm = where.OR[0]?.name?.contains?.toLowerCase() || ''
          results = results.filter(p => 
            p.name.toLowerCase().includes(searchTerm) ||
            p.description.toLowerCase().includes(searchTerm)
          )
        }

        // Category filter
        if (where?.category) {
          results = results.filter(p => p.category === where.category)
        }

        // Price filter
        if (where?.price?.gte) {
          results = results.filter(p => p.price >= where.price.gte)
        }
        if (where?.price?.lte) {
          results = results.filter(p => p.price <= where.price.lte)
        }

        // Sorting
        if (orderBy?.price) {
          results.sort((a, b) => 
            orderBy.price === 'asc' ? a.price - b.price : b.price - a.price
          )
        }
        if (orderBy?.rating) {
          results.sort((a, b) => 
            orderBy.rating === 'desc' ? b.rating - a.rating : a.rating - b.rating
          )
        }

        // Limit
        if (take) {
          results = results.slice(0, take)
        }

        return results
      }),
      count: vi.fn(async ({ where }: any) => {
        return mockProducts.length
      })
    }
  }
  return { default: prisma, prisma }
})

function buildRequest(searchParams: Record<string, string>): Request {
  const url = new URL('https://example.com/api/search')
  Object.entries(searchParams).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })
  return new Request(url.toString())
}

describe('Search API', () => {
  it('searches products by name', async () => {
    const req = buildRequest({ q: 'Nike' })
    const res = await GET(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.results.length).toBe(2)
    expect(json.results.every((p: any) => p.name.includes('Nike'))).toBe(true)
  })

  it('searches products by description', async () => {
    const req = buildRequest({ q: 'running' })
    const res = await GET(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.results.length).toBeGreaterThan(0)
  })

  it('filters by category', async () => {
    const req = buildRequest({ q: 'shoes', category: 'Shoes' })
    const res = await GET(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.results.every((p: any) => p.category === 'Shoes')).toBe(true)
  })

  it('filters by price range', async () => {
    const req = buildRequest({ 
      q: 'Nike',
      minPrice: '100',
      maxPrice: '200'
    })
    const res = await GET(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.results.every((p: any) => p.price >= 100 && p.price <= 200)).toBe(true)
  })

  it('sorts by price ascending', async () => {
    const req = buildRequest({ q: 'shoes', sortBy: 'price', order: 'asc' })
    const res = await GET(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    const prices = json.results.map((p: any) => p.price)
    expect(prices).toEqual([...prices].sort((a, b) => a - b))
  })

  it('sorts by price descending', async () => {
    const req = buildRequest({ q: 'shoes', sortBy: 'price', order: 'desc' })
    const res = await GET(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    const prices = json.results.map((p: any) => p.price)
    expect(prices).toEqual([...prices].sort((a, b) => b - a))
  })

  it('sorts by rating', async () => {
    const req = buildRequest({ q: 'shoes', sortBy: 'rating' })
    const res = await GET(req)
    expect(res.status).toBe(200)
  })

  it('limits results', async () => {
    const req = buildRequest({ q: 'Nike', limit: '1' })
    const res = await GET(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.results.length).toBeLessThanOrEqual(1)
  })

  it('returns empty array for no matches', async () => {
    const req = buildRequest({ q: 'NonExistentProduct' })
    const res = await GET(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.results).toEqual([])
  })

  it('requires search query', async () => {
    const req = buildRequest({})
    const res = await GET(req)
    expect(res.status).toBe(400)
  })

  it('returns total count', async () => {
    const req = buildRequest({ q: 'Nike' })
    const res = await GET(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.total).toBeDefined()
    expect(typeof json.total).toBe('number')
  })

  it('handles pagination', async () => {
    const req = buildRequest({ q: 'shoes', page: '1', limit: '2' })
    const res = await GET(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.page).toBe(1)
    expect(json.results.length).toBeLessThanOrEqual(2)
  })
})
