"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, DollarSign, Check, X, RefreshCw } from "lucide-react"

interface Refund {
  id: string
  orderId: string
  amount: string
  reason: string
  status: "pending" | "approved" | "completed" | "rejected"
  createdAt: string
  order: {
    id: string
    orderNumber: string
    totalAmount: string
    user: { name?: string; email: string }
  }
}

interface Stats {
  totalRefunded: number
  pendingAmount: number
  pendingCount: number
}

export default function AdminRefundsPage() {
  const [loading, setLoading] = useState(false)
  const [refunds, setRefunds] = useState<Refund[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [status, setStatus] = useState<string>("all")

  const loadRefunds = useCallback(async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams()
      if (status !== "all") qs.set("status", status)
      const res = await fetch(`/api/admin/refunds?${qs.toString()}`)
      const json = await res.json()
      setRefunds(json.data?.refunds || [])
      setStats(json.data?.stats || null)
    } catch (e) {
      toast.error("Failed to load refunds")
    } finally { setLoading(false) }
  }, [status])

  useEffect(() => { loadRefunds() }, [loadRefunds])

  const handleAction = async (id: string, action: "approve" | "reject" | "complete") => {
    if (action === "complete" && !confirm("Process this refund? This action cannot be undone.")) return
    
    try {
      const res = await fetch(`/api/admin/refunds/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      })
      if (!res.ok) throw new Error("Action failed")
      toast.success(`Refund ${action}d`)
      loadRefunds()
    } catch {
      toast.error("Action failed")
    }
  }

  function formatMoney(v: number) { 
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v) 
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-6 w-6" />
          <div>
            <h1 className="text-3xl font-bold">Refunds</h1>
            <p className="text-muted-foreground">Process and manage order refunds</p>
          </div>
        </div>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Refunds</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingCount}</div>
              <p className="text-xs text-muted-foreground">{formatMoney(stats.pendingAmount)} total</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Refunded</CardTitle>
              <Check className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatMoney(stats.totalRefunded)}</div>
              <p className="text-xs text-muted-foreground">Completed refunds</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Refund</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.pendingCount > 0 ? formatMoney(stats.pendingAmount / stats.pendingCount) : "$0.00"}
              </div>
              <p className="text-xs text-muted-foreground">Per request</p>
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
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={loadRefunds} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Refund Requests</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {refunds.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">#{r.order.orderNumber}</TableCell>
                  <TableCell>
                    <div className="text-sm">{r.order.user.name || r.order.user.email}</div>
                  </TableCell>
                  <TableCell className="font-medium">{formatMoney(Number(r.amount))}</TableCell>
                  <TableCell className="max-w-xs truncate text-sm">{r.reason}</TableCell>
                  <TableCell className="text-sm">{new Date(r.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={
                      r.status === "completed" ? "default" : 
                      r.status === "approved" ? "secondary" :
                      r.status === "rejected" ? "destructive" : 
                      "outline"
                    }>
                      {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {r.status === "pending" && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleAction(r.id, "approve")}>
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleAction(r.id, "reject")}>
                            <X className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                      {r.status === "approved" && (
                        <Button size="sm" variant="default" onClick={() => handleAction(r.id, "complete")}>
                          <RefreshCw className="h-3 w-3 mr-1" /> Process
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {refunds.length === 0 && (
            <div className="text-center text-muted-foreground py-10">No refunds found</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
