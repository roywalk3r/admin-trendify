"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function OrderTrackPage() {
  const params = useParams<{ orderNumber: string }>()
  const orderNumber = params?.orderNumber as string
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

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

  if (loading) return <div className="container mx-auto max-w-3xl py-10">Tracking…</div>
  if (error) return <div className="container mx-auto max-w-3xl py-10 text-destructive">{error}</div>
  if (!order) return null

  const eta = order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : "—"

  return (
    <div className="container mx-auto max-w-3xl py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Track Order #{order.orderNumber}</h1>
        <Badge variant="secondary">{order.status}</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded border p-4">
          <p className="text-xs text-muted-foreground mb-1">Tracking number</p>
          <p className="font-medium break-all">{order.trackingNumber || "—"}</p>
        </div>
        <div className="rounded border p-4">
          <p className="text-xs text-muted-foreground mb-1">Estimated delivery</p>
          <p className="font-medium">{eta}</p>
        </div>
        <div className="rounded border p-4">
          <p className="text-xs text-muted-foreground mb-1">Driver</p>
          {order.driver ? (
            <div className="text-sm">
              <p className="font-medium leading-tight">{order.driver.name}</p>
              <p className="text-muted-foreground">{order.driver.phone}{order.driver.email ? ` · ${order.driver.email}` : ""}</p>
            </div>
          ) : (
            <p className="font-medium">{order.status === "shipped" ? "Driver assigned soon" : "Preparing shipment"}</p>
          )}
        </div>
      </div>

      <div className="rounded border p-4">
        <p className="text-sm font-medium mb-2">Latest status</p>
        <p className="text-sm text-muted-foreground">{statusMessage(order.status)}</p>
      </div>

      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => router.push(`/${(params as any)?.locale || "en"}/orders/${orderNumber}`)}>View order details</Button>
        <Button onClick={() => router.push(`/${(params as any)?.locale || "en"}/`)}>Back to home</Button>
      </div>
    </div>
  )
}

function statusMessage(status: string) {
  switch (status) {
    case "pending":
      return "Your order was received and is being prepared."
    case "processing":
      return "Your order is being packaged for shipment."
    case "shipped":
      return "Your order has been shipped and is on its way."
    case "delivered":
      return "Your order was delivered. We hope you enjoy it!"
    case "canceled":
      return "Your order was canceled. If this is unexpected, contact support."
    default:
      return "Status updating…"
  }
}
