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
}

export default function CheckoutButton({ addressId: addressIdProp, delivery, shippingFee: shippingFeeProp }: Props) {
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
      const baseAmount = Number(totalAmount) + Number(shippingFee)
      // Gross-up so customer pays the fee: G = (B + f) / (1 - r), fee = G - B
      const r = Number(paymentFee.percentage) || 0
      const f = Number(paymentFee.fixedFee) || 0
      const grossTotal = r > 0 ? (baseAmount + f) / (1 - r) : baseAmount + f
      const gatewayFee = Math.max(0, grossTotal - baseAmount)
      const finalAmount = grossTotal
      setLoading(true)

      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // include shipping + gateway fee in amount (server will re-compute shipping and we include fee breakdown)
          amount: finalAmount,
          email: user.primaryEmailAddress.emailAddress,
          currency: "GHS",
          metadata: {
            items,
            delivery: { ...deliverySel, fee: shippingFee },
            fees: {
              gateway: gatewayFee,
              gatewayBreakdown: {
                percentage: paymentFee.percentage,
                fixed: paymentFee.fixedFee,
              },
              baseAmount,
            },
          },
          addressId,
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