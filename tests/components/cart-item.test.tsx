import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CartItem } from '@/components/cart/cart-item'

vi.mock('@/lib/cart-store', () => ({
  useCartStore: () => ({
    updateQuantity: vi.fn(),
    removeItem: vi.fn()
  })
}))

describe('CartItem Component', () => {
  const mockItem = {
    id: 'item1',
    productId: 'prod1',
    name: 'Test Product',
    price: 100,
    quantity: 2,
    image: 'test-image.jpg',
    slug: 'test-product'
  }

  it('renders cart item correctly', () => {
    render(<CartItem item={mockItem} />)
    
    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('₵100.00')).toBeInTheDocument()
  })

  it('displays correct quantity', () => {
    render(<CartItem item={mockItem} />)
    
    const quantityInput = screen.getByRole('spinbutton')
    expect(quantityInput).toHaveValue(2)
  })

  it('calculates subtotal correctly', () => {
    render(<CartItem item={mockItem} />)
    
    // Subtotal should be price * quantity
    expect(screen.getByText('₵200.00')).toBeInTheDocument()
  })

  it('calls updateQuantity when quantity changes', () => {
    const { useCartStore } = require('@/lib/cart-store')
    const updateQuantity = vi.fn()
    useCartStore.mockReturnValue({
      updateQuantity,
      removeItem: vi.fn()
    })

    render(<CartItem item={mockItem} />)
    
    const increaseBtn = screen.getByRole('button', { name: /increase/i })
    fireEvent.click(increaseBtn)
    
    expect(updateQuantity).toHaveBeenCalledWith('item1', 3)
  })

  it('calls removeItem when remove button clicked', () => {
    const { useCartStore } = require('@/lib/cart-store')
    const removeItem = vi.fn()
    useCartStore.mockReturnValue({
      updateQuantity: vi.fn(),
      removeItem
    })

    render(<CartItem item={mockItem} />)
    
    const removeBtn = screen.getByRole('button', { name: /remove/i })
    fireEvent.click(removeBtn)
    
    expect(removeItem).toHaveBeenCalledWith('item1')
  })

  it('disables decrease button at quantity 1', () => {
    const item = { ...mockItem, quantity: 1 }
    render(<CartItem item={item} />)
    
    const decreaseBtn = screen.getByRole('button', { name: /decrease/i })
    expect(decreaseBtn).toBeDisabled()
  })

  it('renders product image', () => {
    render(<CartItem item={mockItem} />)
    
    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('alt', 'Test Product')
  })
})
