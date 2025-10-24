"use client"
import { useCartStore } from "@/lib/store/cart-store"
import { useUser, SignInButton } from "@clerk/nextjs"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { computeDeliveryFee, type DeliverySelection } from "@/lib/shipping"
import { usePaymentFee } from "@/lib/contexts/settings-context"

type Props = {
  addressId?: string | null
  delivery?: DeliverySelection
  shippingFee?: number
  couponCode?: string
  discount?: number
}

export default function CheckoutButton({ addressId: addressIdProp, delivery, shippingFee: shippingFeeProp, couponCode, discount }: Props) {
  // Split selectors to minimize re-renders
  const items = useCartStore((s) => s.items)
  const subtotal = useCartStore((s) => s.subtotal)

  const { user, isLoaded } = useUser()
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const paymentFee = usePaymentFee()

  // Memoize computed values
  const hasItems = useMemo(() => items.length > 0, [items.length])
  const totalAmount = useMemo(() => subtotal(), [subtotal])

  // Gateway fee is computed via settings context (percentage + fixed)

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
      // Validate delivery selection
      const deliverySel = delivery || { method: "pickup" as const, pickupCity: null, pickupLocation: null }
      if (deliverySel.method === "pickup") {
        if (!deliverySel.pickupCity || !deliverySel.pickupLocation) {
          toast({ title: "Select pickup city and location", variant: "destructive" })
          return
        }
      }
      // Require an address only for door-to-door
      let addressId = addressIdProp || undefined
      if (deliverySel.method === "door") {
        if (!addressId) {
          const addrRes = await fetch("/api/profile/addresses")
          if (!addrRes.ok) {
            toast({ title: "Unable to load addresses", description: "Please try again.", variant: "destructive" })
            return
          }
          const addrJson = await addrRes.json()
          const addresses: any[] = Array.isArray(addrJson?.data) ? addrJson.data : []
          if (!addresses || addresses.length === 0) {
            toast({
              title: "No address on file",
              description: "Add a shipping address in your profile before checkout.",
              variant: "destructive",
            })
            return
          }
          const selected = addresses.find((a: any) => a.isDefault) || addresses[0]
          addressId = selected?.id
          if (!addressId) {
            toast({ title: "Invalid address", description: "Please update your address and try again.", variant: "destructive" })
            return
          }
        }
      }
      const shippingFee = typeof shippingFeeProp === "number" ? shippingFeeProp : computeDeliveryFee(deliverySel.method, deliverySel.pickupCity)
      const baseAmount = Number(totalAmount) + Number(shippingFee) - Number(discount || 0)
      // Gross-up so customer pays the fee: G = (B + f) / (1 - r), fee = G - B
      const r = Number(paymentFee.percentage) || 0
      const f = Number(paymentFee.fixedFee) || 0
      const grossTotal = r > 0 ? (baseAmount + f) / (1 - r) : baseAmount + f
      const gatewayFee = Math.max(0, grossTotal - baseAmount)
      const finalAmount = grossTotal
      setLoading(true)

      // Step 1: Create order on server (atomic: stock, coupon, totals)
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id || user.externalId || undefined,
          items: items.map((it) => ({ productId: it.id, quantity: it.quantity })),
          addressId,
          shipping: shippingFee,
          tax: 0,
          paymentMethod: "paystack",
          couponCode: couponCode || undefined,
        }),
      })
      if (!orderRes.ok) {
        let msg = String(orderRes.status)
        try { const j = await orderRes.json(); msg = j?.message || j?.error || msg } catch {}
        throw new Error(msg)
      }
      const orderJson = await orderRes.json()
      const orderId: string | undefined = orderJson?.order?.id
      if (!orderId) throw new Error("Order creation failed")

      // Step 2: Initialize Paystack for this order
      const initRes = await fetch("/api/payments/paystack/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          email: user.primaryEmailAddress.emailAddress,
          callbackUrl: undefined,
        }),
      })
      if (!initRes.ok) {
        let msg = String(initRes.status)
        try { const j = await initRes.json(); msg = j?.error || msg } catch {}
        throw new Error(msg)
      }
      const initJson = await initRes.json()
      const url: string | undefined = initJson?.data?.authorization_url
      if (!url) throw new Error("No authorization url")
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