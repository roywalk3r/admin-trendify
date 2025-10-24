"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCartStore } from "@/lib/store/cart-store"

export default function OrderDetailsPage() {
  const params = useParams<{ orderNumber: string }>()
  const orderNumber = params?.orderNumber as string
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const addItem = useCartStore((s) => s.addItem)
  const router = useRouter()

  const formatMoney = (amount: number, currency = "USD") =>
    new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount)

  useEffect(() => {
    const load = async () => {
      if (!orderNumber) return
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/my-orders/${encodeURIComponent(orderNumber)}`, { cache: "no-store" })
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || `Failed to fetch order ${orderNumber}`)
        setOrder(json.data)
      } catch (e: any) {
        setError(e?.message || String(e))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [orderNumber])

  const reorder = async () => {
    if (!order?.orderItems?.length) return
    // Add each item back to cart with quantity
    for (const it of order.orderItems) {
      addItem({
        id: it.productId,
        name: it.productName,
        price: Number(it.unitPrice),
        quantity: it.quantity,
        image: (it.productData as any)?.image || "/placeholder.svg",
      })
    }
    router.push("/checkout")
  }

  if (loading) return <div className="container mx-auto max-w-3xl py-10">Loading order…</div>
  if (error) return <div className="container mx-auto max-w-3xl py-10 text-destructive">{error}</div>
  if (!order) return null

  return (
    <>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          .print-area img {
            max-width: 40px !important;
            max-height: 40px !important;
          }
          .print-area {
            font-size: 12px;
          }
          .print-area h1 {
            font-size: 18px;
          }
          .print-area .text-2xl {
            font-size: 18px;
          }
        }
      `}</style>
      <div className="container mx-auto max-w-3xl py-10 space-y-6 print-area">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Order #{order.orderNumber}</h1>
        <Badge variant="secondary">{order.status}</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded border p-4">
          <p className="text-sm text-muted-foreground mb-1">Date</p>
          <p className="font-medium">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <div className="rounded border p-4">
          <p className="text-sm text-muted-foreground mb-1">Payment</p>
          <p className="font-medium">{order?.payment?.method?.toUpperCase()} · {order?.payment?.currency}</p>
        </div>
      </div>

      <div className="rounded border">
        {order.orderItems?.map((it: any) => (
          <div key={it.id} className="flex items-center gap-3 p-3 border-b last:border-b-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {it?.productData?.image ? (
              <img src={it.productData.image} alt={it.productName} className="h-12 w-12 rounded object-cover ring-1 ring-border" />
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
        ))}
      </div>

      <div className="ml-auto w-full max-w-sm space-y-2">
        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>{formatMoney(Number(order.subtotal), order?.payment?.currency || "USD")}</span></div>
        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tax</span><span>{formatMoney(Number(order.tax), order?.payment?.currency || "USD")}</span></div>
        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Shipping</span><span>{formatMoney(Number(order.shipping), order?.payment?.currency || "USD")}</span></div>
        {Number(order?.payment?.gatewayFee || 0) > 0 && (
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Gateway fee</span><span>{formatMoney(Number(order?.payment?.gatewayFee || 0), order?.payment?.currency || "USD")}</span></div>
        )}
        {Number(order.discount) > 0 && (
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Discount</span><span>-{formatMoney(Number(order.discount), order?.payment?.currency || "USD")}</span></div>
        )}
        <div className="flex justify-between border-t pt-2 font-medium"><span>Total</span><span>{formatMoney(Number(order.totalAmount), order?.payment?.currency || "USD")}</span></div>
      </div>

      <div className="flex gap-2 no-print">
        <Button onClick={reorder} className="bg-ascent text-ascent-foreground hover:bg-ascent/90">Order again</Button>
        <Button variant="secondary" onClick={() => window.print()}>Print</Button>
      </div>
      </div>
    </>
  )
}
