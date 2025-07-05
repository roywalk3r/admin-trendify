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
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  totalItems: () => number
  subtotal: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const { items } = get()
        const existingItem = items.find((i) => i.id === item.id && i.color === item.color && i.size === item.size)

        if (existingItem) {
          // Update quantity if item exists
          set({
            items: items.map((i) =>
              i.id === item.id && i.color === item.color && i.size === item.size
                ? { ...i, quantity: i.quantity + item.quantity }
                : i,
            ),
          })
        } else {
          // Add new item
          set({ items: [...items, item] })
        }
      },

      removeItem: (id) => {
        const { items } = get()
        set({ items: items.filter((i) => i.id !== id) })
      },

      updateQuantity: (id, quantity) => {
        const { items } = get()
        if (quantity < 1) return

        set({
          items: items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        })
      },

      clearCart: () => set({ items: [] }),

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
    },
  ),
)
