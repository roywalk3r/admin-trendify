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
  const [order, setOrder] = useState<any>(null)
  const clearCart = useCartStore((s) => s.clearCart)
  const setItems = useCartStore((s) => s.setItems)
  const { toast } = useToast()

  const formatMoney = (amount: number, currency = "USD") =>
    new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount)

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
          setOrder(json?.data?.order || null)
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
      <h1 className="text-2xl font-semibold">{status === "success" ? "Receipt" : `Payment ${status}`}</h1>
      {status === "verifying" && <p>Verifying your payment...</p>}
      {status !== "verifying" && (
        <div className="space-y-6 text-sm">
          {status === "success" && order ? (
            <div className="rounded-lg border bg-background">
              {/* Header */}
              <div className="flex items-center bg-ascent justify-between border-b p-5">
                <div className="space-y-0.5">
                  <p className="text-lg font-semibold text-white">Order #{order.orderNumber}</p>
                  <p className="text-white">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-white">
                  Paid
                </span>
              </div>

              {/* Summary */}
              <div className="grid gap-4 p-5 sm:grid-cols-2">
                <div className="rounded-md border p-4">
                  <p className="text-xs text-muted-foreground mb-1">Payment</p>
                  <p className="font-medium">{order?.payment?.method?.toUpperCase()} · {order?.payment?.currency}</p>
                  <p className="text-muted-foreground text-xs">Reference: {reference}</p>
                </div>
                <div className="rounded-md border p-4">
                  <p className="text-xs text-muted-foreground mb-1">Total Paid</p>
                  <p className="text-xl font-semibold">{formatMoney(Number(order.totalAmount), order?.payment?.currency || "USD")}</p>
                </div>
              </div>

              {/* Items */}
              <div className="p-5">
                <h2 className="mb-2 text-base font-medium">Items</h2>
                <div className="divide-y rounded-md border">
                  {order.orderItems?.map((it: any) => {
                    const img = it?.productData?.image as string | undefined
                    return (
                      <div key={it.id} className="flex items-center gap-3 p-3">
                        {img ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={img} alt={it.productName} className="h-12 w-12 rounded object-cover ring-1 ring-border" />
                        ) : (
                          <div className="h-12 w-12 rounded bg-muted" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium leading-tight">{it.productName}</p>
                          <p className="text-xs text-muted-foreground">Qty {it.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatMoney(Number(it.unitPrice), order?.payment?.currency || "USD")}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Totals */}
              <div className="p-5">
                <div className="ml-auto w-full max-w-sm space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>{formatMoney(Number(order.subtotal), order?.payment?.currency || "USD")}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tax</span><span>{formatMoney(Number(order.tax), order?.payment?.currency || "USD")}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Shipping</span><span>{formatMoney(Number(order.shipping), order?.payment?.currency || "USD")}</span></div>
                  {Number(order.discount) > 0 && (
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Discount</span><span>-{formatMoney(Number(order.discount), order?.payment?.currency || "USD")}</span></div>
                  )}
                  <div className="flex justify-between border-t pt-2 font-medium"><span>Total</span><span>{formatMoney(Number(order.totalAmount), order?.payment?.currency || "USD")}</span></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {details && <pre className="bg-muted p-3 rounded text-xs overflow-auto">{JSON.stringify(details, null, 2)}</pre>}
            </div>
          )}

          <div className="flex gap-2 print:hidden">
            <Button className="bg-primary text-primary-foreground hover:opacity-90" onClick={() => window.print()}>Print receipt</Button>
            <Button variant="secondary" asChild>
              <a href="/">Back to home</a>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
