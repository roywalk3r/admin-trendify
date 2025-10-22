import { useEffect, useRef } from "react"
import { useAuth } from "@clerk/nextjs"
import { useCartStore } from "@/lib/store/cart-store"
import { logInfo, logError } from "@/lib/logger"

/**
 * Cart sync hook - automatically syncs guest cart with user cart on sign in
 * 
 * Usage:
 * Add this to your root layout or a top-level component:
 * 
 * import { useCartSync } from "@/hooks/use-cart-sync"
 * 
 * export default function RootLayout() {
 *   useCartSync()
 *   return (...)
 * }
 */
export function useCartSync() {
  const { isSignedIn, isLoaded } = useAuth()
  const { items, setItems, hydrated } = useCartStore()
  const hasSynced = useRef(false)
  const previousSignedIn = useRef<boolean | undefined>(undefined)

  useEffect(() => {
    // Only run when:
    // 1. Auth is loaded
    // 2. Cart store is hydrated (localStorage loaded)
    // 3. User just signed in (transitioned from signed out to signed in)
    // 4. Haven't synced yet in this session
    if (
      !isLoaded ||
      !hydrated ||
      hasSynced.current ||
      previousSignedIn.current === isSignedIn
    ) {
      previousSignedIn.current = isSignedIn
      return
    }

    // User just signed in
    if (isSignedIn && previousSignedIn.current === false) {
      syncCart()
    }

    previousSignedIn.current = isSignedIn
  }, [isSignedIn, isLoaded, hydrated, items])

  async function syncCart() {
    try {
      hasSynced.current = true

      // Get guest cart items from localStorage
      const guestCartItems = items

      if (guestCartItems.length === 0) {
        // No guest cart to sync, just fetch user cart
        const response = await fetch("/api/cart/sync")
        if (response.ok) {
          const data = await response.json()
          if (data.data?.items) {
            setItems(data.data.items)
          }
        }
        return
      }

      // Merge guest cart with user cart
      const response = await fetch("/api/cart/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          guestCartItems,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to sync cart")
      }

      const data = await response.json()

      if (data.data?.items) {
        // Update localStorage with merged cart
        setItems(data.data.items)

        logInfo("Cart synced successfully", {
          guestItemsCount: guestCartItems.length,
          mergedItemsCount: data.data.items.length,
        })

        // Optional: Show toast notification
        // toast.success(data.data.message || "Cart items merged!")
      }
    } catch (error) {
      logError(error, { context: "Cart sync" })
      // Don't clear the cart on error - keep guest items
      hasSynced.current = false // Allow retry
    }
  }
}
