"use client"

import { useEffect } from "react"
import { useAuth } from "@clerk/nextjs"

export function useProductView(productId: string) {
  const { userId, isSignedIn } = useAuth()

  useEffect(() => {
    if (!productId) return

    const trackProductView = async () => {
      try {
        // Record the product view
        await fetch("/api/analytics/product-view", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId,
            userId: userId || undefined,
            timestamp: new Date().toISOString(),
          }),
        })
      } catch (error) {
        // Silently fail - we don't want to disrupt the user experience
        console.error("Failed to track product view:", error)
      }
    }

    // Small delay to ensure the product was actually viewed
    const timeout = setTimeout(() => {
      trackProductView()
    }, 2000)

    return () => clearTimeout(timeout)
  }, [productId, userId, isSignedIn])

  return null
}
