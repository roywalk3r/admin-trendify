import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useCartSync } from '@/hooks/use-cart-sync'

beforeEach(() => {
  vi.clearAllMocks()
})

vi.mock('@/lib/cart-store', () => ({
  useCartStore: vi.fn(() => ({
    items: [],
    setItems: vi.fn(),
    syncWithServer: vi.fn()
  }))
}))

vi.mock('@/lib/api-client', () => ({
  fetchCart: vi.fn(async () => ({
    items: [
      {
        id: 'item1',
        productId: 'prod1',
        name: 'Test Product',
        price: 100,
        quantity: 2,
        image: 'image.jpg'
      }
    ]
  }))
}))

describe('useCartSync Hook', () => {
  it('initializes and syncs cart on mount', async () => {
    const { result } = renderHook(() => useCartSync())
    
    expect(result.current.isLoading).toBe(true)
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('fetches cart from server', async () => {
    const { fetchCart } = require('@/lib/api-client')
    
    renderHook(() => useCartSync())
    
    await waitFor(() => {
      expect(fetchCart).toHaveBeenCalled()
    })
  })

  it('updates local store with server data', async () => {
    const { useCartStore } = require('@/lib/cart-store')
    const setItems = vi.fn()
    useCartStore.mockReturnValue({
      items: [],
      setItems,
      syncWithServer: vi.fn()
    })

    renderHook(() => useCartSync())
    
    await waitFor(() => {
      expect(setItems).toHaveBeenCalled()
    })
  })

  it('handles sync errors gracefully', async () => {
    const { fetchCart } = require('@/lib/api-client')
    fetchCart.mockRejectedValueOnce(new Error('Network error'))
    
    const { result } = renderHook(() => useCartSync())
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeDefined()
    })
  })

  it('syncs cart periodically', async () => {
    vi.useFakeTimers()
    const { fetchCart } = require('@/lib/api-client')
    
    renderHook(() => useCartSync())
    
    await waitFor(() => {
      expect(fetchCart).toHaveBeenCalledTimes(1)
    })
    
    // Fast-forward time
    vi.advanceTimersByTime(60000) // 1 minute
    
    await waitFor(() => {
      expect(fetchCart).toHaveBeenCalledTimes(2)
    })
    
    vi.useRealTimers()
  })

  it('provides manual sync function', async () => {
    const { result } = renderHook(() => useCartSync())
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    
    const { fetchCart } = require('@/lib/api-client')
    fetchCart.mockClear()
    
    await result.current.sync()
    
    expect(fetchCart).toHaveBeenCalled()
  })
})
