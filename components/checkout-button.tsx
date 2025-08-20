"use client"
import { useCartStore } from "@/lib/store/cart-store"
import { useUser, SignInButton } from "@clerk/nextjs"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export default function CheckoutButton() {
  // Split selectors to minimize re-renders
  const items = useCartStore((s) => s.items)
  const subtotal = useCartStore((s) => s.subtotal)

  const { user, isLoaded } = useUser()
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Memoize computed values
  const hasItems = useMemo(() => items.length > 0, [items.length])
  const totalAmount = useMemo(() => subtotal(), [subtotal])

  const onCheckout = async () => {
    try {
      if (!isLoaded) return
      if (!user?.primaryEmailAddress?.emailAddress) {
        toast({ title: "Please sign in", description: "Sign in to proceed to payment", variant: "destructive" })
        return
      }
      if (!hasItems) {
        toast({ title: "Your cart is empty" })
        return
      }
      if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
        toast({ title: "Invalid amount", description: "Cart total must be greater than 0", variant: "destructive" })
        return
      }
      setLoading(true)

      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalAmount,
          email: user.primaryEmailAddress.emailAddress,
          currency: "GHS",
          metadata: { items },
        }),
      })
      if (!res.ok) {
        let msg = String(res.status)
        try {
          const j = await res.json()
          msg = j?.error || msg
        } catch {}
        throw new Error(msg)
      }
      const json = await res.json()
      const url: string | undefined = json?.data?.authorization_url
      if (!url) throw new Error("No authorization url")
      // Redirect to Paystack checkout
      window.location.href = url
    } catch (e: any) {
      toast({ title: "Checkout failed", description: e?.message || "", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  if (!isLoaded) {
    return (
        <Button disabled className="w-full bg-ascent hover:bg-ascent/90">Loading...</Button>
    )
  }

  if (!user) {
    return (
        <SignInButton mode="modal">
          <Button className="w-full bg-ascent hover:bg-ascent/90">Sign in to Checkout</Button>
        </SignInButton>
    )
  }

  return (
      <Button onClick={onCheckout} disabled={loading} className="w-full bg-ascent hover:bg-ascent/90">
        {loading ? "Redirecting..." : "Pay with Paystack"}
      </Button>
  )
}