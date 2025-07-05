"use client"

import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { CartItem } from "@/components/store/cart-provider"

interface CheckoutReviewProps {
  shippingInfo: any
  paymentInfo: any
  cartItems: CartItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  onBack: () => void
  onSubmit: () => void
  isSubmitting: boolean
}

export function CheckoutReview({
  shippingInfo,
  paymentInfo,
  cartItems,
  subtotal,
  shipping,
  tax,
  total,
  onBack,
  onSubmit,
  isSubmitting,
}: CheckoutReviewProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Review Your Order</h2>

      <div className="space-y-6">
        {/* Shipping Information */}
        <div>
          <h3 className="text-base font-medium mb-2">Shipping Information</h3>
          <div className="bg-muted/30 p-4 rounded-lg">
            <p className="font-medium">
              {shippingInfo.firstName} {shippingInfo.lastName}
            </p>
            <p>{shippingInfo.address}</p>
            <p>
              {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}
            </p>
            <p>{shippingInfo.country}</p>
            <p className="mt-2">{shippingInfo.email}</p>
            <p>{shippingInfo.phone}</p>
          </div>
        </div>

        {/* Payment Information */}
        <div>
          <h3 className="text-base font-medium mb-2">Payment Information</h3>
          <div className="bg-muted/30 p-4 rounded-lg">
            <p>Card ending in {paymentInfo.cardNumber.slice(-4)}</p>
            <p>{paymentInfo.cardName}</p>
            <p>Expires: {paymentInfo.expiryDate}</p>
          </div>
        </div>

        {/* Order Items */}
        <div>
          <h3 className="text-base font-medium mb-2">Order Items</h3>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-start">
                <div className="h-16 w-16 rounded-md bg-muted overflow-hidden flex-shrink-0 mr-4">
                  <img src={item.image || "/placeholder.svg"} alt={item.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{item.name}</h4>
                  <div className="text-sm text-muted-foreground mt-1">
                    Qty: {item.quantity} × ${item.price.toFixed(2)}
                  </div>
                  {item.attributes && Object.
              
              .    <div className="text-sm text-muted-foreground mt-1">
                      {Object.entries(item.attributes).map(([key, value]) => (
                        <span key={key} className="mr-2">
                          {key}: {value}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <h3 className="text-base font-medium mb-2">Order Summary</h3>
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                {shipping === 0 ? <span className="text-green-600">Free</span> : <span>${shipping.toFixed(2)}</span>}
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>

              <Separator />

              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Payment
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Place Order"}
          </Button>
        </div>
      </div>
    </div>
  )
}

