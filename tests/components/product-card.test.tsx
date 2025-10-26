import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ProductCard } from '@/components/products/product-card'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}))

vi.mock('@/lib/cart-store', () => ({
  useCartStore: () => ({
    addItem: vi.fn()
  })
}))

describe('ProductCard Component', () => {
  const mockProduct = {
    id: 'prod1',
    name: 'Test Product',
    slug: 'test-product',
    price: 100,
    description: 'Test description',
    images: ['image1.jpg'],
    category: 'Electronics',
    stock: 10,
    rating: 4.5,
    reviewCount: 25
  }

  it('renders product information', () => {
    render(<ProductCard product={mockProduct} />)
    
    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('₵100.00')).toBeInTheDocument()
  })

  it('displays rating and review count', () => {
    render(<ProductCard product={mockProduct} />)
    
    expect(screen.getByText('4.5')).toBeInTheDocument()
    expect(screen.getByText('(25 reviews)')).toBeInTheDocument()
  })

  it('shows out of stock badge when stock is 0', () => {
    const outOfStock = { ...mockProduct, stock: 0 }
    render(<ProductCard product={outOfStock} />)
    
    expect(screen.getByText(/out of stock/i)).toBeInTheDocument()
  })

  it('shows low stock warning when stock is low', () => {
    const lowStock = { ...mockProduct, stock: 3 }
    render(<ProductCard product={lowStock} />)
    
    expect(screen.getByText(/only 3 left/i)).toBeInTheDocument()
  })

  it('handles add to cart click', () => {
    const { useCartStore } = require('@/lib/cart-store')
    const addItem = vi.fn()
    useCartStore.mockReturnValue({ addItem })

    render(<ProductCard product={mockProduct} />)
    
    const addToCartBtn = screen.getByRole('button', { name: /add to cart/i })
    fireEvent.click(addToCartBtn)
    
    expect(addItem).toHaveBeenCalled()
  })

  it('disables add to cart when out of stock', () => {
    const outOfStock = { ...mockProduct, stock: 0 }
    render(<ProductCard product={outOfStock} />)
    
    const addToCartBtn = screen.getByRole('button', { name: /out of stock/i })
    expect(addToCartBtn).toBeDisabled()
  })

  it('renders product image', () => {
    render(<ProductCard product={mockProduct} />)
    
    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('alt', 'Test Product')
  })

  it('navigates to product page on click', () => {
    const { useRouter } = require('next/navigation')
    const push = vi.fn()
    useRouter.mockReturnValue({ push })

    render(<ProductCard product={mockProduct} />)
    
    const card = screen.getByRole('article')
    fireEvent.click(card)
    
    expect(push).toHaveBeenCalledWith('/products/test-product')
  })

  it('displays discount badge when applicable', () => {
    const discounted = { 
      ...mockProduct, 
      originalPrice: 150,
      price: 100 
    }
    render(<ProductCard product={discounted} />)
    
    expect(screen.getByText(/33% off/i)).toBeInTheDocument()
  })
})
