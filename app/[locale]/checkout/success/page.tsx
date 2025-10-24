"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle, Package, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [verifying, setVerifying] = useState(true)
  const [order, setOrder] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const reference = searchParams.get("reference")
  const orderId = searchParams.get("orderId")

  useEffect(() => {
    async function verifyPayment() {
      if (!reference || !orderId) {
        setError("Invalid payment reference")
        setVerifying(false)
        return
      }

      try {
        const response = await fetch("/api/payments/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reference,
            orderId,
          }),
        })

        const data = await response.json()

        if (data.success) {
          setOrder(data.order)
        } else {
          setError(data.message || "Payment verification failed")
        }
      } catch (err) {
        console.error("Payment verification error:", err)
        setError("Failed to verify payment. Please contact support.")
      } finally {
        setVerifying(false)
      }
    }

    verifyPayment()
  }, [reference, orderId])

  if (verifying) {
    return (
      <div className="container mx-auto max-w-2xl py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold mb-2">Verifying Payment...</h2>
          <p className="text-muted-foreground">Please wait while we confirm your payment</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-2xl py-20">
        <div className="text-center">
          <div className="bg-red-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-3xl">✕</span>
          </div>
          <h2 className="text-2xl font-semibold mb-2">Payment Verification Failed</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <div className="space-x-4">
            <Button onClick={() => router.push("/cart")}>Return to Cart</Button>
            <Button variant="outline" onClick={() => router.push("/profile/orders")}>
              View Orders
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl py-20">
      <div className="text-center mb-8">
        <div className="bg-green-100 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
        <p className="text-lg text-muted-foreground">
          Thank you for your purchase. Your order has been successfully placed.
        </p>
      </div>

      {order && (
        <div className="bg-muted/50 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Order Number</p>
              <p className="font-semibold">{order.orderNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-semibold capitalize">{order.status}</p>
            </div>
          </div>

          <div className="bg-background rounded-md p-4 border">
            <div className="flex items-center gap-3 text-sm">
              <Package className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Order Confirmation Email Sent</p>
                <p className="text-muted-foreground">
                  We've sent order details to your email address
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild className="flex-1">
          <Link href={`/orders/${order?.id}`}>
            View Order Details
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-900">
          <strong>What's Next?</strong> Your order is being processed. You'll receive shipping
          updates via email. Track your order anytime from your order history.
        </p>
      </div>
    </div>
  )
}
