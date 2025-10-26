import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/orders/route'

// Mocks
vi.mock('@/lib/email', () => ({
  sendOrderConfirmationEmail: vi.fn().mockResolvedValue({ success: true })
}))

// In-memory stubs to track calls
let calls: Record<string, any[]> = {}

function pushCall(name: string, payload?: any) {
  calls[name] = calls[name] || []
  calls[name].push(payload)
}

// Base data
const userId = 'user_123'
const orderId = 'order_1'
const now = Date.now()

// Dynamic prisma mock allowing behavior tweaks per test
vi.mock('@/lib/prisma', () => {
  const products: Record<string, any> = {
    p1: { id: 'p1', name: 'Prod 1', price: new (class Decimal { constructor(public v = 1000){} valueOf(){return this.v} })() as any, stock: 10, sku: 'SKU1', isActive: true },
  }

  const state = {
    existingOrder: null as any,
    createdOrder: null as any,
  }

  const prisma = {
    user: {
      findFirst: vi.fn(async (q: any) => ({ id: userId, email: 'user@example.com', name: 'User' })),
      create: vi.fn(async () => ({ id: userId, email: 'guest@example.com', name: 'Guest' })),
    },
    address: {
      findFirst: vi.fn(async () => null),
    },
    product: {
      findUnique: vi.fn(async ({ where }: any) => products[where.id] || null),
      update: vi.fn(async ({ where, data }: any) => { pushCall('product.update', { where, data }); return products[where.id] }),
    },
    coupon: {
      findUnique: vi.fn(async () => null),
      update: vi.fn(async () => ({})),
    },
    order: {
      findFirst: vi.fn(async (q: any) => state.existingOrder),
      findUnique: vi.fn(async ({ where }: any) => ({
        id: orderId,
        orderNumber: 'ORD-TEST',
        paymentStatus: 'unpaid',
        subtotal: 1000,
        tax: 0,
        shipping: 0,
        totalAmount: 1000,
        estimatedDelivery: new Date(now + 3*86400000).toISOString(),
        user: { id: userId, email: 'user@example.com', name: 'User' },
        orderItems: [
          { id: 'oi1', productId: 'p1', productName: 'Prod 1', quantity: 1, unitPrice: 1000, product: { images: ['img1'] } },
        ],
        payment: { id: 'pay1', method: 'paystack', status: 'unpaid', currency: 'NGN' },
        shippingAddress: null,
      })),
      create: vi.fn(async ({ data }: any) => { pushCall('order.create', data); state.createdOrder = { id: orderId, ...data }; return state.createdOrder }),
    },
    orderItem: {
      createMany: vi.fn(async ({ data }: any) => { pushCall('orderItem.createMany', data); return { count: data?.length || 0 } }),
    },
    shippingAddress: {
      create: vi.fn(async ({ data }: any) => { pushCall('shippingAddress.create', data); return data }),
    },
    payment: {
      create: vi.fn(async ({ data }: any) => { pushCall('payment.create', data); return data }),
    },
    $transaction: vi.fn(async (fn: any) => {
      const tx = {
        order: { create: prisma.order.create },
        orderItem: { createMany: prisma.orderItem.createMany },
        shippingAddress: { create: prisma.shippingAddress.create },
        payment: { create: prisma.payment.create },
        product: { update: prisma.product.update },
        coupon: { update: prisma.coupon.update },
      }
      return fn(tx)
    }),
  }

  return { prisma }
})

// Helper to build a Request for the route
function buildPost(body: any) {
  return new Request('https://example.com/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as any
}

beforeEach(() => { calls = {} })

describe('POST /api/orders idempotency', () => {
  it('creates an order on first call and reuses on second with same signature', async () => {
    const payload = {
      userId: 'clerk_abc',
      email: 'user@example.com',
      items: [{ productId: 'p1', quantity: 1 }],
      shipping: 0,
      tax: 0,
      paymentMethod: 'paystack',
      delivery: { method: 'pickup', pickupCity: 'Accra', pickupLocation: 'HQ' },
    }

    // First call: no existing order
    const { prisma } = await import('@/lib/prisma') as any
    prisma.order.findFirst.mockResolvedValueOnce(null)

    const res1 = await POST(buildPost(payload))
    expect(res1.status).toBe(201)
    const json1 = await res1.json()
    expect(json1?.data?.order?.id).toBeDefined()
    expect(calls['order.create']?.length || 0).toBe(1)

    // Second call: same signature returns existing unpaid order
    prisma.order.findFirst.mockResolvedValueOnce({ id: 'order_1', orderNumber: 'ORD-TEST', status: 'pending', paymentStatus: 'unpaid', notes: 'sig:abc', createdAt: new Date().toISOString() })

    const res2 = await POST(buildPost(payload))
    expect(res2.status).toBe(200)
    const json2 = await res2.json()
    expect(json2?.data?.order?.id).toBe('order_1')
    // Ensure no additional create call
    expect(calls['order.create']?.length || 0).toBe(1)
  })
})
