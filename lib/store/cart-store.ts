import { create } from "zustand"
import { persist } from "zustand/middleware"

export type CartItem = {
    id: string
    name: string
    price: number
    quantity: number
    color?: string
    size?: string
    image: string
}

type CartStore = {
    items: CartItem[]
    hydrated: boolean
    setItems: (items: CartItem[]) => void
    addItem: (item: CartItem) => void
    removeItem: (id: string, color?: string, size?: string) => void
    updateQuantity: (id: string, quantity: number, color?: string, size?: string) => void
    clearCart: () => void
    mergeItems: (newItems: CartItem[]) => void
    totalItems: () => number
    subtotal: () => number
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            hydrated: false,

            setItems: (items) => set({ items }),

            addItem: (item) => {
                const { items } = get()
                const existingItemIndex = items.findIndex(
                    (i) => i.id === item.id && i.color === item.color && i.size === item.size
                )

                if (existingItemIndex !== -1) {
                    // Update quantity if item exists - more efficient than map
                    const newItems = [...items]
                    newItems[existingItemIndex] = {
                        ...newItems[existingItemIndex],
                        quantity: newItems[existingItemIndex].quantity + item.quantity
                    }
                    set({ items: newItems })
                } else {
                    // Add new item
                    set({ items: [...items, item] })
                }
            },

            removeItem: (id, color, size) => {
                const { items } = get()
                set({
                    items: items.filter((i) =>
                        !(i.id === id && i.color === color && i.size === size)
                    )
                })
            },

            updateQuantity: (id, quantity, color, size) => {
                if (quantity < 1) return

                const { items } = get()
                const itemIndex = items.findIndex(
                    (i) => i.id === id && i.color === color && i.size === size
                )

                if (itemIndex !== -1) {
                    const newItems = [...items]
                    newItems[itemIndex] = { ...newItems[itemIndex], quantity }
                    set({ items: newItems })
                }
            },

            clearCart: () => set({ items: [] }),

            mergeItems: (newItems) => {
                const { items } = get()
                const mergedMap = new Map<string, CartItem>()

                // Add existing items to map
                items.forEach((item) => {
                    const key = `${item.id}-${item.color || ''}-${item.size || ''}`
                    mergedMap.set(key, item)
                })

                // Merge new items
                newItems.forEach((item) => {
                    const key = `${item.id}-${item.color || ''}-${item.size || ''}`
                    const existing = mergedMap.get(key)
                    
                    if (existing) {
                        // Add quantities together
                        mergedMap.set(key, {
                            ...existing,
                            quantity: existing.quantity + item.quantity,
                        })
                    } else {
                        mergedMap.set(key, item)
                    }
                })

                set({ items: Array.from(mergedMap.values()) })
            },

            totalItems: () => {
                const { items } = get()
                return items.reduce((total, item) => total + item.quantity, 0)
            },

            subtotal: () => {
                const { items } = get()
                return items.reduce((total, item) => total + item.price * item.quantity, 0)
            },
        }),
        {
            name: "cart-storage",
            onRehydrateStorage: () => {
                return (state, error) => {
                    // Mark store as hydrated regardless of success to avoid blocking forever
                    // We cannot access `set` here; use the store's static setState API
                    try {
                        useCartStore.setState({ hydrated: true })
                    } catch {
                        // no-op
                    }
                }
            },
        },
    ),
)