"use client"

import { ClerkProvider, useUser } from "@clerk/nextjs"
import type React from "react"
import { useEffect, useRef } from "react"
import { useCartStore } from "@/lib/store/cart-store"
import { SettingsProvider } from "@/lib/contexts/settings-context"

function CartSync() {
  const { isSignedIn, user } = useUser()
  const syncedForUserRef = useRef<string | null>(null)
  const isSyncingRef = useRef(false)
  const items = useCartStore((s) => s.items)
  const hydrated = useCartStore((s) => s.hydrated)
  const setItems = useCartStore((s) => s.setItems)
  const mergeItems = useCartStore((s) => s.mergeItems)

  useEffect(() => {
    // Ensure local storage has loaded before any sync
    if (!hydrated) return

    // Reset sync marker when signed out
    if (!isSignedIn || !user?.id) {
      syncedForUserRef.current = null
      return
    }

    // Avoid duplicate syncs per user session
    if (syncedForUserRef.current === user.id || isSyncingRef.current) return

    let cancelled = false
    isSyncingRef.current = true

    const sync = async () => {
      try {
        // 1) POST guest items once to merge on server
        const postRes = await fetch("/api/cart/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ guestCartItems: items }),
        })

        // It's okay if POST fails (network, etc.) — fall back to GET
        // 2) GET merged server cart
        const getRes = await fetch("/api/cart/sync", { cache: "no-store" })
        if (getRes.ok) {
          const json = await getRes.json()
          const serverItems = (json?.data?.items ?? []).map((i: any) => ({
            id: i.id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            image: i.image,
            color: i.color,
            size: i.size,
          }))

          if (!cancelled) {
            // Merge server items into local cart to avoid losing guest items
            if (serverItems.length > 0) {
              mergeItems(serverItems)
            }
          }
        }

        if (!cancelled) syncedForUserRef.current = user.id
      } catch {
        // Silent failure — keep guest cart as-is
      } finally {
        isSyncingRef.current = false
      }
    }

    void sync()

    return () => {
      cancelled = true
    }
  }, [isSignedIn, user?.id, hydrated])

  return null
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider afterSignOutUrl={"/en"} afterSignInUrl={"/en"}>
      <SettingsProvider>
        <CartSync />
        {children}
      </SettingsProvider>
    </ClerkProvider>
  )
}

