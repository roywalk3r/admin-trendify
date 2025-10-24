"use client"

import { useSearchParams } from "next/navigation"
import { XCircle, ArrowLeft, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function CheckoutFailedPage() {
  const searchParams = useSearchParams()
  const message = searchParams.get("message") || "Your payment was not successful"

  return (
    <div className="container mx-auto max-w-2xl py-20">
      <div className="text-center mb-8">
        <div className="bg-red-100 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-6">
          <XCircle className="h-12 w-12 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Payment Failed</h1>
        <p className="text-lg text-muted-foreground">{message}</p>
      </div>

      <div className="bg-muted/50 rounded-lg p-6 mb-6">
        <h3 className="font-semibold mb-3">Common reasons for payment failure:</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>Insufficient funds in your account</span>
          </li>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>Card limit exceeded</span>
          </li>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>Incorrect card details or expired card</span>
          </li>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>Payment was cancelled</span>
          </li>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>Network or connection issues</span>
          </li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Button asChild className="flex-1">
          <Link href="/checkout">
            <RotateCcw className="mr-2 h-4 w-4" />
            Try Again
          </Link>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link href="/cart">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Cart
          </Link>
        </Button>
      </div>

      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <p className="text-sm text-yellow-900">
          <strong>Need Help?</strong> If you continue to experience issues, please contact our
          support team. Your items are still in your cart and no payment was charged.
        </p>
      </div>
    </div>
  )
}
