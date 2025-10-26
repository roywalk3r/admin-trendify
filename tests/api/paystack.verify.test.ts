import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '@/app/api/paystack/verify/route'

beforeEach(() => {
  vi.resetModules()
  vi.unstubAllEnvs()
  vi.stubEnv('PAYSTACK_SECRET_KEY', 'sk_test_x')
})

vi.mock('@/lib/prisma', () => {
  const prisma = {
    deliveryCity: { findFirst: vi.fn(async () => ({ id: 'c1', name: 'Accra', isActive: true, pickupLocations: [{ name: 'HQ', isActive: true }] })) },
    product: { findMany: vi.fn(async () => [{ id: 'p1' }]) },
    order: {
      findFirst: vi.fn(async () => null),
      findUnique: vi.fn(async ({ where }: any) => ({ id: where.id, orderNumber: 'REF-1', subtotal: 1000, tax: 0, shipping: 0, totalAmount: 1000, paymentStatus: 'unpaid', status: 'pending', user: { name: 'User' }, orderItems: [{ id: 'oi1', productName: 'Item', quantity: 1, unitPrice: 1000, product: { images: ['img'] } }], payment: null })),
      update: vi.fn(async ({ where, data }: any) => ({ id: where.id, orderNumber: 'REF-1', subtotal: 1000, tax: 0, shipping: 0, totalAmount: 1000, paymentStatus: data.paymentStatus, status: data.status, user: { name: 'User' }, orderItems: [{ id: 'oi1', productName: 'Item', quantity: 1, unitPrice: 1000, product: { images: ['img'] } }], payment: { status: 'paid', amount: 1000 } })),
    },
    payment: {
      upsert: vi.fn(async () => ({})),
    },
    orderItem: { createMany: vi.fn(async () => ({ count: 1 })) },
  }
  return { default: prisma, prisma }
})

vi.mock('@/lib/email', () => ({ sendOrderConfirmationEmail: vi.fn(async () => ({ success: true })) }))

vi.mock('@clerk/nextjs/server', () => ({ auth: vi.fn(async () => ({ userId: 'user_1' })) }))

vi.mock('@/lib/paystack', () => ({
  isPaystackTxSuccess: (tx: any) => tx.status === 'success',
  paystackVerify: vi.fn(async (_sk: string, _ref: string) => ({
    status: true,
    data: {
      status: 'success',
      currency: 'NGN',
      amount: 100000,
      fees: 1500,
      reference: 'REF-1',
      customer: { email: 'user@example.com' },
      metadata: {
        userId: 'u1',
        orderId: 'o1',
        delivery: { method: 'pickup', pickupCity: 'Accra', pickupLocation: 'HQ' },
        items: [{ id: 'p1', name: 'Item', price: 1000, quantity: 1 }],
      },
    },
  })),
}))

function buildReq() {
  return new Request('https://example.com/api/paystack/verify?reference=REF-1') as any
}

describe('GET /api/paystack/verify', () => {
  it('marks order paid on successful verify and returns updated order', async () => {
    const res = await GET(buildReq())
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json?.data?.order?.paymentStatus).toBe('paid')
    expect(json?.data?.order?.orderItems?.[0]?.product?.images?.[0]).toBe('img')
  })

  it('validates pickup selection', async () => {
    const { paystackVerify } = await import('@/lib/paystack') as any
    paystackVerify.mockResolvedValueOnce({
      status: true,
      data: {
        status: 'success',
        currency: 'NGN',
        amount: 100000,
        fees: 1500,
        reference: 'REF-1',
        customer: { email: 'user@example.com' },
        metadata: { delivery: { method: 'pickup', pickupCity: '', pickupLocation: '' } },
      },
    })

    const res = await GET(buildReq())
    expect(res.status).toBe(400)
  })
})
