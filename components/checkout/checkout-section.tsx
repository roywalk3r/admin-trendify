"use client"
import { useEffect, useMemo, useState } from "react"
import AddressPicker from "@/components/checkout/address-picker"
import DeliveryOptions from "@/components/checkout/delivery-options"
import { type DeliverySelection } from "@/lib/shipping"
import { usePaymentFee } from "@/lib/contexts/settings-context"
import { useCartStore } from "@/lib/store/cart-store"
import CheckoutButton from "@/components/checkout-button"
import { useI18n } from "@/lib/i18n/I18nProvider"

export default function CheckoutSection() {
  const { t } = useI18n()
  const subtotal = useCartStore((s) => s.subtotal)
  const [addressId, setAddressId] = useState<string | null>(null)
  const [delivery, setDelivery] = useState<DeliverySelection>({ method: "pickup", pickupCity: null, pickupLocation: null })
  const [shippingFee, setShippingFee] = useState<number>(0)
  // Fetch dynamic shipping fee when delivery or address changes
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (delivery.method === "pickup") {
        if (!cancelled) setShippingFee(0)
        return
      }
      // Use the city selected in DeliveryOptions for door delivery
      const city = delivery.pickupCity || ""
      if (process.env.NODE_ENV !== "production") {
        console.log("[Checkout] Computing door fee for city:", city)
      }
      try {
        const res = await fetch(`/api/shipping/fee?method=door&city=${encodeURIComponent(city)}`, { cache: "no-store" })
        if (!res.ok) throw new Error("Failed to fetch shipping fee")
        const json = await res.json()
        const fee = Number(json?.data?.fee ?? 0)
        if (process.env.NODE_ENV !== "production") {
          console.log("[Checkout] Fee API response:", json)
          console.log("[Checkout] Parsed fee:", fee)
        }
        if (!cancelled) setShippingFee(Number.isFinite(fee) ? fee : 0)
      } catch {
        // No local fallback; rely strictly on API. If it fails, show 0.
        if (!cancelled) setShippingFee(0)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [delivery.method, delivery.pickupCity])
  const { percentage: gatewayRate, fixedFee: gatewayFixed } = usePaymentFee()
  const base = useMemo(() => Number(subtotal()) + Number(shippingFee), [subtotal, shippingFee])
  const gatewayFee = useMemo(() => {
    const r = Number(gatewayRate) || 0
    const f = Number(gatewayFixed) || 0
    if (base <= 0) return 0
    if (r <= 0) return f
    const gross = (base + f) / (1 - r)
    return Math.max(0, gross - base)
  }, [base, gatewayRate, gatewayFixed])
  const estimatedTotal = base + gatewayFee

  return (
    <div className="space-y-4">
      <AddressPicker selectedId={addressId} onChange={setAddressId} />
      <div className="rounded-md border p-4 space-y-3">
        <DeliveryOptions value={delivery} onChange={setDelivery} />
        <div className="text-sm text-muted-foreground">{t("checkout.shippingFee")}: <span className="font-medium text-foreground">{shippingFee.toFixed(2)}</span></div>
        <div className="text-sm text-muted-foreground">{t("checkout.gatewayFee")}: <span className="font-medium text-foreground">{gatewayFee.toFixed(2)}</span></div>
        <div className="flex justify-between text-sm pt-1 border-t mt-1"><span className="text-muted-foreground">{t("checkout.estimatedTotal")}</span><span className="font-medium text-foreground">{estimatedTotal.toFixed(2)}</span></div>
      </div>
      <CheckoutButton addressId={addressId || undefined} delivery={delivery} shippingFee={shippingFee} />
    </div>
  )
}
