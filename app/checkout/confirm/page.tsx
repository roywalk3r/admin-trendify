"use client"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/lib/store/cart-store"
import { useToast } from "@/hooks/use-toast"

export default function CheckoutConfirmPage() {
  const params = useSearchParams()
  const reference = params.get("reference")
  const [status, setStatus] = useState<string>("verifying")
  const [details, setDetails] = useState<any>(null)
  const clearCart = useCartStore((s) => s.clearCart)
  const setItems = useCartStore((s) => s.setItems)
  const { toast } = useToast()

  useEffect(() => {
    const verify = async () => {
      if (!reference) return
      try {
        const res = await fetch(`/api/paystack/verify?reference=${encodeURIComponent(reference)}`)
        const json = await res.json()
        if (res.ok) {
          const payStatus: string = json?.data?.status || "success"
          setStatus(payStatus)
          setDetails(json?.data)
          if (payStatus === "success") {
            // Clear local cart immediately
            clearCart()
            setItems([])
            // Best-effort clear server cart
            try {
              await fetch("/api/cart?clear=1", { method: "DELETE" })
            } catch {}
            toast({ title: "Payment successful", description: `Reference ${reference}` })
          } else {
            toast({ title: "Payment not successful", description: payStatus, variant: "destructive" })
          }
        } else {
          setStatus("failed")
          toast({ title: "Verification failed", description: json?.error || "" , variant: "destructive" })
        }
      } catch {
        setStatus("failed")
        toast({ title: "Verification error", variant: "destructive" })
      }
    }
    verify()
  }, [reference])

  return (
    <div className="container mx-auto max-w-3xl py-10 space-y-4">
      <h1 className="text-2xl font-semibold">Payment {status === "success" ? "Success" : status}</h1>
      {status === "verifying" && <p>Verifying your payment...</p>}
      {status !== "verifying" && (
        <div className="space-y-2 text-sm">
          <p><strong>Reference:</strong> {reference}</p>
          {details && <pre className="bg-muted p-3 rounded text-xs overflow-auto">{JSON.stringify(details, null, 2)}</pre>}
          <Button asChild>
            <a href="/">Back to home</a>
          </Button>
        </div>
      )}
    </div>
  )
}
