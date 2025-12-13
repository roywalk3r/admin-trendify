"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Loader2, Bell, Package } from "lucide-react"

interface StockAlert {
  id: string
  email: string
  productId: string
  variantId?: string | null
  notified: boolean
  createdAt: string
  notifiedAt?: string | null
}

export default function AdminStockAlertsPage() {
  const [loading, setLoading] = useState(false)
  const [alerts, setAlerts] = useState<StockAlert[]>([])
  const [stats, setStats] = useState<any>(null)
  const [notified, setNotified] = useState<string>("false")

  async function loadAlerts() {
    setLoading(true)
    try {
      const qs = new URLSearchParams()
      if (notified !== "all") qs.set("notified", notified)
      const res = await fetch(`/api/admin/stock-alerts?${qs.toString()}`)
      const json = await res.json()
      setAlerts(json.data?.alerts || [])
      setStats(json.data?.stats || null)
    } catch (e) {
      toast.error("Failed to load stock alerts")
    } finally { setLoading(false) }
  }

  useEffect(() => { loadAlerts() }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6" />
          <div>
            <h1 className="text-3xl font-bold">Stock Alerts</h1>
            <p className="text-muted-foreground">Manage back-in-stock notification requests</p>
          </div>
        </div>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Alerts</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPending}</div>
              <p className="text-xs text-muted-foreground">Across {stats.pending} products</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notifications Sent</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{alerts.filter(a => a.notified).length}</div>
              <p className="text-xs text-muted-foreground">From current page</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Select value={notified} onValueChange={setNotified}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="false">Pending</SelectItem>
                <SelectItem value="true">Notified</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={loadAlerts} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stock Alerts</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Product ID</TableHead>
                <TableHead>Variant ID</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notified At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.map(a => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.email}</TableCell>
                  <TableCell className="font-mono text-xs">{a.productId.slice(0, 12)}...</TableCell>
                  <TableCell className="font-mono text-xs">{a.variantId ? a.variantId.slice(0, 12) + "..." : "-"}</TableCell>
                  <TableCell>{new Date(a.createdAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={a.notified ? "default" : "secondary"}>
                      {a.notified ? "Notified" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>{a.notifiedAt ? new Date(a.notifiedAt).toLocaleString() : "-"}</TableCell>
                  <TableCell>
                    {!a.notified && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={loading}
                        onClick={async () => {
                          try {
                            const res = await fetch("/api/admin/stock-alerts/trigger", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ productId: a.productId }),
                            })
                            const json = await res.json().catch(() => ({}))
                            if (!res.ok) {
                              throw new Error(json?.error || "Failed to trigger notifications")
                            }
                            toast.success("Stock alert notifications sent")
                            loadAlerts()
                          } catch (e) {
                            toast.error("Failed to trigger notifications")
                          }
                        }}
                      >
                        Trigger Notification
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {alerts.length === 0 && (
            <div className="text-center text-muted-foreground py-10">No stock alerts found</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
