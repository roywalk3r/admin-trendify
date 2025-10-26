import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import OrderDetailsPage from '@/app/[locale]/orders/[orderNumber]/page'

vi.mock('next/navigation', async () => {
  const actual = await vi.importActual<any>('next/navigation')
  return {
    ...actual,
    useParams: () => ({ orderNumber: 'ORD-555' }),
  }
})

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('OrderDetailsPage', () => {
  it('renders shipment panel and item image fallback', async () => {
    vi.spyOn(global, 'fetch' as any).mockResolvedValueOnce(new Response(JSON.stringify({
      data: {
        orderNumber: 'ORD-555',
        createdAt: new Date().toISOString(),
        status: 'processing',
        payment: { method: 'paystack', currency: 'USD' },
        trackingNumber: 'TRACK-1',
        estimatedDelivery: new Date().toISOString(),
        driver: { name: 'Driver A', phone: '0200000000', email: 'd@example.com' },
        subtotal: 80,
        tax: 10,
        shipping: 10,
        totalAmount: 100,
        orderItems: [
          { id: 'oi1', productId: 'p1', productName: 'Item 1', quantity: 1, unitPrice: 100, productData: {}, product: { images: ['/fallback.png'] } },
        ],
      }
    }), { status: 200 }))

    render(<OrderDetailsPage />)

    expect(await screen.findByText(/Order #ORD-555/)).toBeInTheDocument()
    expect(screen.getByText(/Tracking number/i)).toBeInTheDocument()
    expect(screen.getByText(/Estimated delivery/i)).toBeInTheDocument()
    expect(screen.getByText(/Driver A/)).toBeInTheDocument()
  })
})
