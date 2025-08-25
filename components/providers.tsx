"use client"

import { ClerkProvider, useUser } from "@clerk/nextjs"
import type React from "react"
import { useEffect, useRef } from "react"
import { useCartStore } from "@/lib/store/cart-store"

function CartSync() {
  const { isSignedIn, user } = useUser()
  const syncedForUserRef = useRef<string | null>(null)
  const items = useCartStore((s) => s.items)
  const hydrated = useCartStore((s) => s.hydrated)
  const setItems = useCartStore((s) => s.setItems)

  useEffect(() => {
    // Wait until local store is hydrated so we don't lose guest items
    if (!hydrated) return

    // Only attempt sync when signed in and not already synced for this user
    if (!isSignedIn || !user?.id) {
      syncedForUserRef.current = null
      return
    }
    if (syncedForUserRef.current === user.id) return

    let cancelled = false

    const sync = async () => {
      try {
        // Merge local items into server cart (server will upsert/accumulate by product/color/size)
        for (const it of items) {
          try {
            await fetch("/api/cart", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: it.id,
                name: it.name,
                price: it.price,
                quantity: it.quantity,
                image: it.image,
                color: it.color,
                size: it.size,
              }),
            })
          } catch {
            // continue with others
          }
        }

        // Fetch the server cart and replace local items with server truth
        const res = await fetch("/api/cart", { cache: "no-store" })
        if (res.ok) {
          const json = await res.json()
          const serverItems = (json?.data?.items ?? []).map((i: any) => ({
            id: i.id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            image: i.image,
            color: i.color,
            size: i.size,
          }))
          // Only replace local cart if server actually has items, or if local is empty
          if (!cancelled) {
            if (serverItems.length > 0 || items.length === 0) {
              setItems(serverItems)
            }
          }
        }
        if (!cancelled) syncedForUserRef.current = user.id
      } catch {
        // ignore
      }
    }

    // Kick off sync
    void sync()

    return () => {
      cancelled = true
    }
    // Re-run when user id changes or hydration completes
  }, [isSignedIn, user?.id, hydrated])

  return null
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      afterSignOutUrl={"/"}
      appearance={{
        captcha: {
          theme: "auto",
          size: "flexible",
          language: "es-ES",
        },
      }}
    >
      <CartSync />
      {children}
    </ClerkProvider>
  )
}
