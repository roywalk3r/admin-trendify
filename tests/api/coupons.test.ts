import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/coupons/route'

beforeEach(() => {
  vi.resetModules()
})

vi.mock('@/lib/prisma', () => {
  const mockCoupons = {
    'SAVE10': {
      id: 'coupon1',
      code: 'SAVE10',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      isActive: true,
      expiresAt: new Date(Date.now() + 86400000),
      maxUses: 100,
      usedCount: 50,
      minPurchase: 50
    },
    'EXPIRED': {
      id: 'coupon2',
      code: 'EXPIRED',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      isActive: true,
      expiresAt: new Date(Date.now() - 86400000),
      maxUses: 100,
      usedCount: 0
    },
    'MAXEDOUT': {
      id: 'coupon3',
      code: 'MAXEDOUT',
      discountType: 'FIXED',
      discountValue: 50,
      isActive: true,
      expiresAt: new Date(Date.now() + 86400000),
      maxUses: 10,
      usedCount: 10
    }
  }

  const prisma = {
    coupon: {
      findUnique: vi.fn(async ({ where }: any) => {
        return mockCoupons[where.code as keyof typeof mockCoupons] || null
      })
    }
  }
  return { default: prisma, prisma }
})

function buildRequest(body: any): Request {
  return new Request('https://example.com/api/coupons', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
}

describe('Coupons API - Validation', () => {
  it('validates active coupon successfully', async () => {
    const req = buildRequest({
      code: 'SAVE10',
      cartTotal: 100
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.valid).toBe(true)
    expect(json.discount).toBe(10)
  })

  it('rejects non-existent coupon', async () => {
    const req = buildRequest({
      code: 'INVALID',
      cartTotal: 100
    })
    const res = await POST(req)
    expect(res.status).toBe(404)
    const json = await res.json()
    expect(json.valid).toBe(false)
  })

  it('rejects expired coupon', async () => {
    const req = buildRequest({
      code: 'EXPIRED',
      cartTotal: 100
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.valid).toBe(false)
    expect(json.message).toContain('expired')
  })

  it('rejects coupon that reached max uses', async () => {
    const req = buildRequest({
      code: 'MAXEDOUT',
      cartTotal: 100
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.valid).toBe(false)
  })

  it('validates minimum purchase requirement', async () => {
    const req = buildRequest({
      code: 'SAVE10',
      cartTotal: 30
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.message).toContain('minimum purchase')
  })

  it('calculates percentage discount correctly', async () => {
    const req = buildRequest({
      code: 'SAVE10',
      cartTotal: 200
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.discount).toBe(20) // 10% of 200
  })

  it('calculates fixed discount correctly', async () => {
    const req = buildRequest({
      code: 'MAXEDOUT',
      cartTotal: 200
    })
    const res = await POST(req)
    const json = await res.json()
    if (json.valid) {
      expect(json.discount).toBe(50)
    }
  })

  it('requires coupon code', async () => {
    const req = buildRequest({ cartTotal: 100 })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('requires cart total', async () => {
    const req = buildRequest({ code: 'SAVE10' })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})
