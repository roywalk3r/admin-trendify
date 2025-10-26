import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/checkout/route'

beforeEach(() => {
  vi.resetModules()
})

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(async () => ({ userId: 'user123' }))
}))

vi.mock('@/lib/prisma', () => {
  const prisma = {
    cart: {
      findFirst: vi.fn(async ({ where }: any) => ({
        id: 'cart123',
        userId: where.userId || null,
        sessionId: where.sessionId || null,
        items: [
          {
            id: 'item1',
            productId: 'prod1',
            quantity: 2,
            product: {
              id: 'prod1',
              name: 'Test Product',
              price: 100,
              stock: 10,
              images: ['image1.jpg']
            }
          }
        ]
      }))
    },
    address: {
      findUnique: vi.fn(async ({ where }: any) => ({
        id: where.id,
        userId: 'user123',
        fullName: 'John Doe',
        street: '123 Main St',
        city: 'Accra',
        state: 'GA',
        zipCode: '00000',
        country: 'GH',
        phone: '+233123456789'
      }))
    },
    coupon: {
      findUnique: vi.fn(async ({ where }: any) => {
        if (where.code === 'VALID10') {
          return {
            id: 'coupon1',
            code: 'VALID10',
            discountType: 'PERCENTAGE',
            discountValue: 10,
            isActive: true,
            expiresAt: new Date(Date.now() + 86400000), // Tomorrow
            maxUses: 100,
            usedCount: 0
          }
        }
        return null
      })
    }
  }
  return { default: prisma, prisma }
})

vi.mock('@/lib/paystack', () => ({
  initializePayment: vi.fn(async (data: any) => ({
    status: true,
    data: {
      authorization_url: 'https://checkout.paystack.com/test123',
      access_code: 'test_access_code',
      reference: 'test_reference_123'
    }
  }))
}))

function buildRequest(body: any): Request {
  return new Request('https://example.com/api/checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-session-id': 'session123'
    },
    body: JSON.stringify(body)
  })
}

describe('Checkout API - POST', () => {
  it('initiates checkout for authenticated user', async () => {
    const req = buildRequest({
      addressId: 'addr1',
      shippingMethod: 'standard'
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.checkout_url).toBeDefined()
  })

  it('handles guest checkout', async () => {
    const { auth } = await import('@clerk/nextjs/server') as any
    auth.mockResolvedValueOnce({ userId: null })

    const req = buildRequest({
      email: 'guest@example.com',
      shippingAddress: {
        fullName: 'Guest User',
        street: '123 Main St',
        city: 'Accra',
        state: 'GA',
        zipCode: '00000',
        country: 'GH',
        phone: '+233123456789'
      },
      shippingMethod: 'standard'
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
  })

  it('applies valid coupon code', async () => {
    const req = buildRequest({
      addressId: 'addr1',
      shippingMethod: 'standard',
      couponCode: 'VALID10'
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.discount).toBeGreaterThan(0)
  })

  it('rejects invalid coupon code', async () => {
    const req = buildRequest({
      addressId: 'addr1',
      shippingMethod: 'standard',
      couponCode: 'INVALID'
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('requires shipping information', async () => {
    const req = buildRequest({})
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('validates cart is not empty', async () => {
    const { default: prisma } = await import('@/lib/prisma') as any
    prisma.cart.findFirst.mockResolvedValueOnce({
      id: 'cart123',
      items: []
    })

    const req = buildRequest({
      addressId: 'addr1',
      shippingMethod: 'standard'
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('calculates shipping costs correctly', async () => {
    const req = buildRequest({
      addressId: 'addr1',
      shippingMethod: 'express'
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.shippingCost).toBeGreaterThan(0)
  })
})
