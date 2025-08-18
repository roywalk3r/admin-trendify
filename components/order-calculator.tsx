"use client"

import { useOrderRestrictions, calculateOrderTotal } from "@/lib/settings-restrictions"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface OrderCalculatorProps {
  subtotal: number
  className?: string
}

export function OrderCalculator({ subtotal, className }: OrderCalculatorProps) {
  const restrictions = useOrderRestrictions()
  const total = calculateOrderTotal(subtotal, restrictions)

  const tax = restrictions.enableTaxCalculation ? (subtotal * restrictions.taxRate) / 100 : 0
  const shipping =
    restrictions.enableFreeShipping && subtotal >= restrictions.freeShippingThreshold ? 0 : restrictions.shippingFee

  return (
    <div className={className}>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>

        {restrictions.enableTaxCalculation && (
          <div className="flex justify-between">
            <span>Tax ({restrictions.taxRate}%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span>Shipping</span>
          <div className="flex items-center gap-2">
            {shipping === 0 ? <Badge variant="secondary">Free</Badge> : <span>${shipping.toFixed(2)}</span>}
          </div>
        </div>

        {restrictions.enableFreeShipping && subtotal < restrictions.freeShippingThreshold && (
          <div className="text-sm text-muted-foreground">
            Add ${(restrictions.freeShippingThreshold - subtotal).toFixed(2)} more for free shipping
          </div>
        )}

        <Separator />

        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}
