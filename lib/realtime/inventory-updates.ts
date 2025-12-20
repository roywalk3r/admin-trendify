"use client"

import { useEffect, useState, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { useCartStore } from '@/lib/store/cart-store'

interface InventoryUpdate {
  productId: string
  variantId?: string
  stock: number
  previousStock: number
  lastUpdated: string
}

interface InventorySubscription {
  productIds: string[]
  onUpdate: (update: InventoryUpdate) => void
  onLowStock: (productId: string, stock: number) => void
}

class InventoryManager {
  private subscriptions: Map<string, InventorySubscription> = new Map()
  private eventSource: EventSource | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  constructor() {
    this.setupEventSource()
  }

  private setupEventSource() {
    try {
      this.eventSource = new EventSource('/api/realtime/inventory')
      
      this.eventSource.onopen = () => {
        console.log('Inventory SSE connection opened')
        this.reconnectAttempts = 0
      }

      this.eventSource.onmessage = (event) => {
        try {
          const update: InventoryUpdate = JSON.parse(event.data)
          this.handleInventoryUpdate(update)
        } catch (error) {
          console.error('Failed to parse inventory update:', error)
        }
      }

      this.eventSource.onerror = (error) => {
        console.error('Inventory SSE error:', error)
        this.eventSource?.close()
        this.attemptReconnect()
      }
    } catch (error) {
      console.error('Failed to setup inventory SSE:', error)
      this.attemptReconnect()
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++
        console.log(`Attempting to reconnect inventory SSE (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
        this.setupEventSource()
      }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts))
    }
  }

  private handleInventoryUpdate(update: InventoryUpdate) {
    // Notify all relevant subscriptions
    for (const [id, subscription] of this.subscriptions) {
      if (subscription.productIds.includes(update.productId)) {
        subscription.onUpdate(update)
        
        // Check for low stock alerts
        if (update.stock <= 5 && update.previousStock > 5) {
          subscription.onLowStock(update.productId, update.stock)
        }
      }
    }
  }

  subscribe(id: string, subscription: InventorySubscription) {
    this.subscriptions.set(id, subscription)
    
    // Send subscription message to server
    if (this.eventSource?.readyState === EventSource.OPEN) {
      fetch('/api/realtime/inventory/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          subscriptionId: id,
          productIds: subscription.productIds 
        })
      }).catch(error => console.error('Failed to subscribe to inventory updates:', error))
    }
  }

  unsubscribe(id: string) {
    this.subscriptions.delete(id)
    
    // Send unsubscribe message to server
    fetch('/api/realtime/inventory/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriptionId: id })
    }).catch(error => console.error('Failed to unsubscribe from inventory updates:', error))
  }

  async getLatestStock(productId: string, variantId?: string): Promise<number> {
    try {
      const params = new URLSearchParams({ productId })
      if (variantId) params.set('variantId', variantId)
      
      const response = await fetch(`/api/inventory/stock?${params}`)
      const data = await response.json()
      return data.stock || 0
    } catch (error) {
      console.error('Failed to get latest stock:', error)
      return 0
    }
  }

  destroy() {
    this.eventSource?.close()
    this.subscriptions.clear()
  }
}

// Global inventory manager instance
let inventoryManager: InventoryManager | null = null

function getInventoryManager(): InventoryManager {
  if (typeof window === 'undefined') {
    throw new Error('InventoryManager can only be used in browser environment')
  }
  
  if (!inventoryManager) {
    inventoryManager = new InventoryManager()
  }
  
  return inventoryManager
}

// React hook for inventory updates
export function useInventoryUpdates(productIds: string[]) {
  const [stockLevels, setStockLevels] = useState<Record<string, number>>({})
  const [lastUpdated, setLastUpdated] = useState<Record<string, string>>({})
  const { toast } = useToast()
  const { items, removeItem, updateQuantity } = useCartStore()

  const handleInventoryUpdate = useCallback((update: InventoryUpdate) => {
    setStockLevels(prev => ({
      ...prev,
      [`${update.productId}${update.variantId ? `-${update.variantId}` : ''}`]: update.stock
    }))
    
    setLastUpdated(prev => ({
      ...prev,
      [`${update.productId}${update.variantId ? `-${update.variantId}` : ''}`]: update.lastUpdated
    }))

    // Check if user has this item in cart and stock is now insufficient
    const cartItem = items.find(item => 
      item.id === update.productId && 
      (!update.variantId || item.variantId === update.variantId)
    )
    
    if (cartItem && cartItem.quantity > update.stock) {
      if (update.stock === 0) {
        toast({
          title: "Item Out of Stock",
          description: `${cartItem.name} is no longer available and has been removed from your cart.`,
          variant: "destructive"
        })
        // Remove from cart
        removeItem(cartItem.id)
      } else {
        toast({
          title: "Stock Limited",
          description: `Only ${update.stock} units of ${cartItem.name} remain. Cart quantity updated.`,
          variant: "destructive"
        })
        // Update cart quantity to max available
        updateQuantity(cartItem.id, update.stock)
      }
    }
  }, [items, toast, removeItem, updateQuantity])

  const handleLowStock = useCallback((productId: string, stock: number) => {
    toast({
      title: "Low Stock Alert",
      description: `Only ${stock} units remaining for this item.`,
      variant: "destructive"
    })
  }, [toast])

  useEffect(() => {
    if (productIds.length === 0) return

    const manager = getInventoryManager()
    const subscriptionId = `inventory-${Date.now()}-${Math.random()}`
    
    manager.subscribe(subscriptionId, {
      productIds,
      onUpdate: handleInventoryUpdate,
      onLowStock: handleLowStock
    })

    // Load initial stock levels
    Promise.all(
      productIds.map(async (productId) => {
        try {
          const stock = await manager.getLatestStock(productId)
          setStockLevels(prev => ({ ...prev, [productId]: stock }))
        } catch (error) {
          console.error(`Failed to load stock for ${productId}:`, error)
        }
      })
    )

    return () => {
      manager.unsubscribe(subscriptionId)
    }
  }, [productIds, handleInventoryUpdate, handleLowStock])

  return {
    stockLevels,
    lastUpdated,
    getStock: (productId: string, variantId?: string) => {
      const key = `${productId}${variantId ? `-${variantId}` : ''}`
      return stockLevels[key] ?? null
    },
    isLowStock: (productId: string, variantId?: string, threshold = 5) => {
      const stock = stockLevels[`${productId}${variantId ? `-${variantId}` : ''}`]
      return stock !== undefined && stock <= threshold && stock > 0
    },
    isOutOfStock: (productId: string, variantId?: string) => {
      const stock = stockLevels[`${productId}${variantId ? `-${variantId}` : ''}`]
      return stock !== undefined && stock === 0
    }
  }
}

// Hook for real-time cart validation
export function useCartInventoryValidation() {
  const { items } = useCartStore()
  const productIds = items.map(item => item.id)
  
  return useInventoryUpdates(productIds)
}

// Cleanup function for when app unmounts
export function cleanupInventoryManager() {
  if (inventoryManager) {
    inventoryManager.destroy()
    inventoryManager = null
  }
}
