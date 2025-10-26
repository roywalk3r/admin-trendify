import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import OrderTrackPage from '@/app/[locale]/orders/[orderNumber]/track/page'

vi.mock('next/navigation', async () => {
  const actual = await vi.importActual<any>('next/navigation')
  return {
    ...actual,
    useParams: () => ({ orderNumber: 'ORD-123', locale: 'en' }),
    useRouter: () => ({ push: vi.fn() }),
  }
})

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('OrderTrackPage', () => {
  it('renders tracking info and driver details', async () => {
    vi.spyOn(global, 'fetch' as any).mockResolvedValueOnce(new Response(JSON.stringify({
      data: {
        orderNumber: 'ORD-123',
        status: 'shipped',
        trackingNumber: 'TRACK-999',
        estimatedDelivery: new Date().toISOString(),
        driver: { name: 'Rider One', phone: '0240000000', email: 'rider@example.com' },
      },
    }), { status: 200 }))

    render(<OrderTrackPage />)

    expect(await screen.findByText(/Track Order #ORD-123/i)).toBeInTheDocument()
    expect(screen.getByText('TRACK-999')).toBeInTheDocument()
    expect(screen.getByText(/Rider One/)).toBeInTheDocument()
  })

  it('shows error on failed fetch', async () => {
    vi.spyOn(global, 'fetch' as any).mockResolvedValueOnce(new Response(JSON.stringify({ error: 'Order not found' }), { status: 404 }))

    render(<OrderTrackPage />)

    await waitFor(() => {
      expect(screen.getByText(/Order not found/i)).toBeInTheDocument()
    })
  })
})
