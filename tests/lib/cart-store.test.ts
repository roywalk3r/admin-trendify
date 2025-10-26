import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore } from '@/lib/cart-store'

describe('Cart Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useCartStore.setState({
      items: [],
      isLoading: false
    })
  })

  it('initializes with empty cart', () => {
    const state = useCartStore.getState()
    expect(state.items).toEqual([])
    expect(state.isLoading).toBe(false)
  })

  it('adds item to cart', () => {
    const { addItem } = useCartStore.getState()
    addItem({
      id: 'item1',
      productId: 'prod1',
      name: 'Test Product',
      price: 100,
      quantity: 1,
      image: 'image.jpg'
    })

    const state = useCartStore.getState()
    expect(state.items.length).toBe(1)
    expect(state.items[0].productId).toBe('prod1')
  })

  it('increments quantity for existing item', () => {
    const { addItem } = useCartStore.getState()
    
    addItem({
      id: 'item1',
      productId: 'prod1',
      name: 'Test Product',
      price: 100,
      quantity: 1,
      image: 'image.jpg'
    })

    addItem({
      id: 'item1',
      productId: 'prod1',
      name: 'Test Product',
      price: 100,
      quantity: 1,
      image: 'image.jpg'
    })

    const state = useCartStore.getState()
    expect(state.items.length).toBe(1)
    expect(state.items[0].quantity).toBe(2)
  })

  it('removes item from cart', () => {
    const { addItem, removeItem } = useCartStore.getState()
    
    addItem({
      id: 'item1',
      productId: 'prod1',
      name: 'Test Product',
      price: 100,
      quantity: 1,
      image: 'image.jpg'
    })

    removeItem('item1')

    const state = useCartStore.getState()
    expect(state.items.length).toBe(0)
  })

  it('updates item quantity', () => {
    const { addItem, updateQuantity } = useCartStore.getState()
    
    addItem({
      id: 'item1',
      productId: 'prod1',
      name: 'Test Product',
      price: 100,
      quantity: 1,
      image: 'image.jpg'
    })

    updateQuantity('item1', 5)

    const state = useCartStore.getState()
    expect(state.items[0].quantity).toBe(5)
  })

  it('clears entire cart', () => {
    const { addItem, clearCart } = useCartStore.getState()
    
    addItem({
      id: 'item1',
      productId: 'prod1',
      name: 'Test Product',
      price: 100,
      quantity: 1,
      image: 'image.jpg'
    })

    addItem({
      id: 'item2',
      productId: 'prod2',
      name: 'Test Product 2',
      price: 200,
      quantity: 2,
      image: 'image2.jpg'
    })

    clearCart()

    const state = useCartStore.getState()
    expect(state.items.length).toBe(0)
  })

  it('calculates total correctly', () => {
    const { addItem, getTotal } = useCartStore.getState()
    
    addItem({
      id: 'item1',
      productId: 'prod1',
      name: 'Test Product',
      price: 100,
      quantity: 2,
      image: 'image.jpg'
    })

    addItem({
      id: 'item2',
      productId: 'prod2',
      name: 'Test Product 2',
      price: 50,
      quantity: 3,
      image: 'image2.jpg'
    })

    const total = getTotal()
    expect(total).toBe(350) // (100 * 2) + (50 * 3)
  })

  it('counts total items correctly', () => {
    const { addItem, getItemCount } = useCartStore.getState()
    
    addItem({
      id: 'item1',
      productId: 'prod1',
      name: 'Test Product',
      price: 100,
      quantity: 2,
      image: 'image.jpg'
    })

    addItem({
      id: 'item2',
      productId: 'prod2',
      name: 'Test Product 2',
      price: 50,
      quantity: 3,
      image: 'image2.jpg'
    })

    const count = getItemCount()
    expect(count).toBe(5) // 2 + 3
  })
})
