import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * Integration test for complete checkout flow
 * Tests the entire user journey from cart to order completion
 */

beforeEach(() => {
  vi.resetModules()
})

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(async () => ({ userId: 'user123' }))
}))

vi.mock('@/lib/prisma', () => {
  const mockData = {
    cart: {
      id: 'cart123',
      userId: 'user123',
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
            images: ['image.jpg']
          }
        }
      ]
    },
    address: {
      id: 'addr1',
      userId: 'user123',
      fullName: 'John Doe',
      street: '123 Main St',
      city: 'Accra',
      state: 'GA',
      zipCode: '00000',
      country: 'GH',
      phone: '+233123456789',
      isDefault: true
    },
    order: null as any
  }

  const prisma = {
    cart: {
      findFirst: vi.fn(async () => mockData.cart),
      update: vi.fn(async ({ data }: any) => ({ ...mockData.cart, ...data }))
    },
    address: {
      findUnique: vi.fn(async () => mockData.address),
      findMany: vi.fn(async () => [mockData.address])
    },
    product: {
      findUnique: vi.fn(async ({ where }: any) => {
        if (where.id === 'prod1') {
          return mockData.cart.items[0].product
        }
        return null
      }),
      update: vi.fn(async ({ where, data }: any) => ({
        id: where.id,
        ...data
      }))
    },
    order: {
      create: vi.fn(async ({ data }: any) => {
        mockData.order = {
          id: 'order123',
          ...data,
          createdAt: new Date()
        }
        return mockData.order
      }),
      findUnique: vi.fn(async ({ where }: any) => {
        if (where.id === 'order123') return mockData.order
        return null
      }),
      update: vi.fn(async ({ where, data }: any) => {
        mockData.order = { ...mockData.order, ...data }
        return mockData.order
      })
    },
    $transaction: vi.fn(async (callback: any) => {
      return callback(prisma)
    })
  }
  return { default: prisma, prisma }
})

vi.mock('@/lib/paystack', () => ({
  initializePayment: vi.fn(async (data: any) => ({
    status: true,
    data: {
      authorization_url: 'https://checkout.paystack.com/test',
      reference: 'ref123'
    }
  })),
  verifyPayment: vi.fn(async (reference: string) => ({
    status: true,
    data: {
      reference,
      status: 'success',
      amount: 20000
    }
  }))
}))

describe('Checkout Flow Integration', () => {
  it('completes full checkout flow', async () => {
    // Step 1: Add items to cart
    const { POST: addToCart } = await import('@/app/api/cart/route')
    const addReq = new Request('https://example.com/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-session-id': 'session123' },
      body: JSON.stringify({ productId: 'prod1', quantity: 2 })
    })
    const addRes = await addToCart(addReq)
    expect(addRes.status).toBe(200)

    // Step 2: Get cart
    const { GET: getCart } = await import('@/app/api/cart/route')
    const getReq = new Request('https://example.com/api/cart', {
      headers: { 'x-session-id': 'session123' }
    })
    const getRes = await getCart(getReq)
    expect(getRes.status).toBe(200)
    const cartData = await getRes.json()
    expect(cartData.cart.items.length).toBeGreaterThan(0)

    // Step 3: Get user addresses
    const { GET: getAddresses } = await import('@/app/api/profile/addresses/route')
    const addrRes = await getAddresses()
    expect(addrRes.status).toBe(200)
    const addrData = await addrRes.json()
    expect(addrData.data.length).toBeGreaterThan(0)

    // Step 4: Initiate checkout
    const { POST: checkout } = await import('@/app/api/checkout/route')
    const checkoutReq = new Request('https://example.com/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-session-id': 'session123' },
      body: JSON.stringify({
        addressId: 'addr1',
        shippingMethod: 'standard'
      })
    })
    const checkoutRes = await checkout(checkoutReq)
    expect(checkoutRes.status).toBe(200)
    const checkoutData = await checkoutRes.json()
    expect(checkoutData.checkout_url).toBeDefined()
    expect(checkoutData.reference).toBeDefined()

    // Step 5: Verify payment
    const { POST: verifyPayment } = await import('@/app/api/paystack/verify/route')
    const verifyReq = new Request('https://example.com/api/paystack/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference: checkoutData.reference })
    })
    const verifyRes = await verifyPayment(verifyReq)
    expect(verifyRes.status).toBe(200)

    // Step 6: Get order details
    const { GET: getOrders } = await import('@/app/api/my-orders/route')
    const ordersRes = await getOrders()
    expect(ordersRes.status).toBe(200)
    const ordersData = await ordersRes.json()
    expect(ordersData.orders).toBeDefined()
  })

  it('handles out of stock during checkout', async () => {
    const { default: prisma } = await import('@/lib/prisma') as any
    
    // Mock product with 0 stock
    prisma.product.findUnique.mockResolvedValueOnce({
      id: 'prod1',
      name: 'Test Product',
      price: 100,
      stock: 0,
      images: ['image.jpg']
    })

    const { POST: checkout } = await import('@/app/api/checkout/route')
    const req = new Request('https://example.com/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-session-id': 'session123' },
      body: JSON.stringify({
        addressId: 'addr1',
        shippingMethod: 'standard'
      })
    })
    const res = await checkout(req)
    expect(res.status).toBe(400)
  })

  it('applies coupon correctly in checkout', async () => {
    const { default: prisma } = await import('@/lib/prisma') as any
    
    // Mock valid coupon
    prisma.coupon = {
      findUnique: vi.fn(async ({ where }: any) => {
        if (where.code === 'SAVE10') {
          return {
            id: 'coupon1',
            code: 'SAVE10',
            discountType: 'PERCENTAGE',
            discountValue: 10,
            isActive: true,
            expiresAt: new Date(Date.now() + 86400000),
            maxUses: 100,
            usedCount: 0
          }
        }
        return null
      })
    }

    const { POST: checkout } = await import('@/app/api/checkout/route')
    const req = new Request('https://example.com/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-session-id': 'session123' },
      body: JSON.stringify({
        addressId: 'addr1',
        shippingMethod: 'standard',
        couponCode: 'SAVE10'
      })
    })
    const res = await checkout(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.discount).toBeGreaterThan(0)
  })

  it('handles payment verification failure', async () => {
    const { verifyPayment } = await import('@/lib/paystack') as any
    verifyPayment.mockResolvedValueOnce({
      status: false,
      message: 'Payment failed'
    })

    const { POST: verify } = await import('@/app/api/paystack/verify/route')
    const req = new Request('https://example.com/api/paystack/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference: 'failed_ref' })
    })
    const res = await verify(req)
    expect(res.status).toBe(400)
  })
})
