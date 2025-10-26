import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useProductView } from '@/hooks/use-product-view'

beforeEach(() => {
  vi.clearAllMocks()
})

vi.mock('@/lib/api-client', () => ({
  trackProductView: vi.fn(async (productId: string) => ({
    success: true,
    viewCount: 42
  })),
  getProductRecommendations: vi.fn(async (productId: string) => ({
    recommendations: [
      { id: 'rec1', name: 'Recommended 1', price: 50 },
      { id: 'rec2', name: 'Recommended 2', price: 75 }
    ]
  }))
}))

describe('useProductView Hook', () => {
  it('tracks product view on mount', async () => {
    const { trackProductView } = require('@/lib/api-client')
    
    renderHook(() => useProductView('prod1'))
    
    await waitFor(() => {
      expect(trackProductView).toHaveBeenCalledWith('prod1')
    })
  })

  it('fetches recommendations', async () => {
    const { getProductRecommendations } = require('@/lib/api-client')
    
    const { result } = renderHook(() => useProductView('prod1'))
    
    await waitFor(() => {
      expect(getProductRecommendations).toHaveBeenCalledWith('prod1')
      expect(result.current.recommendations).toHaveLength(2)
    })
  })

  it('handles tracking errors silently', async () => {
    const { trackProductView } = require('@/lib/api-client')
    trackProductView.mockRejectedValueOnce(new Error('Network error'))
    
    const { result } = renderHook(() => useProductView('prod1'))
    
    await waitFor(() => {
      expect(result.current.error).toBeNull()
    })
  })

  it('provides view count', async () => {
    const { result } = renderHook(() => useProductView('prod1'))
    
    await waitFor(() => {
      expect(result.current.viewCount).toBe(42)
    })
  })

  it('does not track if productId is null', () => {
    const { trackProductView } = require('@/lib/api-client')
    
    renderHook(() => useProductView(null))
    
    expect(trackProductView).not.toHaveBeenCalled()
  })

  it('updates when productId changes', async () => {
    const { trackProductView } = require('@/lib/api-client')
    
    const { rerender } = renderHook(
      ({ productId }) => useProductView(productId),
      { initialProps: { productId: 'prod1' } }
    )
    
    await waitFor(() => {
      expect(trackProductView).toHaveBeenCalledWith('prod1')
    })
    
    trackProductView.mockClear()
    rerender({ productId: 'prod2' })
    
    await waitFor(() => {
      expect(trackProductView).toHaveBeenCalledWith('prod2')
    })
  })
})
