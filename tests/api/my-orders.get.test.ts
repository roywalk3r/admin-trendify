import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '@/app/api/my-orders/[orderNumber]/route'

const ORDER_NUMBER = 'ORD-123'

beforeEach(() => {
  vi.resetModules()
})

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(async () => ({ userId: 'clerk_user' })),
}))

vi.mock('@/lib/prisma', () => {
  const prisma = {
    user: {
      findFirst: vi.fn(async () => ({ id: 'u1' })),
    },
    order: {
      findFirst: vi.fn(async () => ({
        id: 'o1', orderNumber: ORDER_NUMBER,
        payment: { method: 'paystack', currency: 'GHS' },
        orderItems: [{ id: 'oi1', productId: 'p1', productName: 'Item', quantity: 1, unitPrice: 100, product: { images: ['img'] } }],
        shippingAddress: null,
        driver: { id: 'd1', name: 'Driver', phone: '123' },
        coupon: null,
      })),
    },
  }
  return { default: prisma, prisma }
})

function buildReq(): any {
  const url = `https://example.com/api/my-orders/${ORDER_NUMBER}`
  return new Request(url) as any
}

describe('GET /api/my-orders/[orderNumber]', () => {
  it('returns order with driver and coupon and product images', async () => {
    const res = await GET(buildReq(), { params: { orderNumber: ORDER_NUMBER } as any })
    expect(res.status).toBe(200)
    const json = await res.json()
    const order = json.data
    expect(order.orderNumber).toBe(ORDER_NUMBER)
    expect(order.driver?.name).toBe('Driver')
    expect(order.orderItems?.[0]?.product?.images?.[0]).toBe('img')
  })

  it('401 when not authenticated', async () => {
    const { auth } = await import('@clerk/nextjs/server') as any
    auth.mockResolvedValueOnce({ userId: null })
    const res = await GET(buildReq(), { params: { orderNumber: ORDER_NUMBER } as any })
    expect(res.status).toBe(401)
  })
})
