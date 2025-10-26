import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import CheckoutConfirmPage from '@/app/[locale]/checkout/confirm/page'

vi.mock('next/navigation', async () => {
  const actual = await vi.importActual<any>('next/navigation')
  return {
    ...actual,
    useSearchParams: () => new URLSearchParams('reference=REF-OK'),
  }
})

// Mock cart store hooks used in the page
vi.mock('@/lib/store/cart-store', () => ({
  useCartStore: (sel: any) => sel({ clearCart: vi.fn(), setItems: vi.fn(), addItem: vi.fn() }),
}))

vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: vi.fn() }) }))

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('CheckoutConfirmPage', () => {
  it('renders receipt on successful verification', async () => {
    vi.spyOn(global, 'fetch' as any).mockResolvedValueOnce(new Response(JSON.stringify({
      data: {
        status: 'success',
        order: {
          orderNumber: 'ORD-1',
          createdAt: new Date().toISOString(),
          payment: { method: 'paystack', currency: 'USD' },
          totalAmount: 100,
          subtotal: 80,
          tax: 10,
          shipping: 10,
          discount: 0,
          orderItems: [
            { id: 'oi1', productName: 'Item', quantity: 1, unitPrice: 100, productData: { image: '/img.png' } },
          ],
        }
      }
    }), { status: 200 }))

    render(<CheckoutConfirmPage />)

    expect(await screen.findByText(/Receipt/i)).toBeInTheDocument()
    expect(screen.getByText(/Order #ORD-1/)).toBeInTheDocument()
    expect(screen.getByText(/Total Paid/i)).toBeInTheDocument()
  })

  it('shows failure when verification fails', async () => {
    vi.spyOn(global, 'fetch' as any).mockResolvedValueOnce(new Response(JSON.stringify({ error: 'Bad ref' }), { status: 400 }))

    render(<CheckoutConfirmPage />)

    await waitFor(() => {
      expect(screen.getByText(/Payment failed|Payment not successful|Verification failed/i)).toBeTruthy()
    })
  })
})
