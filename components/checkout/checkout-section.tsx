"use client"
import { useMemo, useState } from "react"
import AddressPicker from "@/components/checkout/address-picker"
import DeliveryOptions from "@/components/checkout/delivery-options"
import CheckoutButton from "@/components/checkout-button"
import { computeDeliveryFee, type DeliverySelection } from "@/lib/shipping"

export default function CheckoutSection() {
  const [addressId, setAddressId] = useState<string | null>(null)
  const [delivery, setDelivery] = useState<DeliverySelection>({ method: "pickup", pickupCity: null, pickupLocation: null })
  const shippingFee = useMemo(() => computeDeliveryFee(delivery.method, delivery.pickupCity), [delivery])

  return (
    <div className="space-y-4">
      <AddressPicker selectedId={addressId} onChange={setAddressId} />
      <div className="rounded-md border p-4 space-y-3">
        <DeliveryOptions value={delivery} onChange={setDelivery} />
        <div className="text-sm text-muted-foreground">Delivery fee: <span className="font-medium text-foreground">{shippingFee.toFixed(2)}</span></div>
      </div>
      <CheckoutButton addressId={addressId || undefined} delivery={delivery} />
    </div>
  )
}
