"use client"

import {JSX, ReactNode} from "react"
import { useCartStore } from "@/lib/store/cart-store"

interface CartProviderProps {
  children: ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  // This hook initializes the cart store for SSR/CSR hydration
  useCartStore()
  return children as JSX.Element
}

export default CartProvider
