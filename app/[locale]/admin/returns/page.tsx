"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useCurrency } from "@/lib/contexts/settings-context"
import { toast } from "sonner"
import { Loader2, ClipboardCheck, Truck, RotateCcw, XCircle } from "lucide-react"

interface ReturnItem {
  id: string
  orderId: string
  status: string
  refundAmount: string
  createdAt: string
}

export default function AdminReturnsPage() {
  const [loading, setLoading] = useState(false)
  const [returns, setReturns] = useState<ReturnItem[]>([])
  const [status, setStatus] = useState<string>("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [approveId, setApproveId] = useState<string | null>(null)
  const [form, setForm] = useState({ restockFee: "", shippingCost: "", returnLabel: "" })

  const { format } = useCurrency()

  const load = async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams()
      if (status !== "all") qs.set("status", status)
      const res = await fetch(`/api/admin/returns?${qs.toString()}`)
      const json = await res.json()
      setReturns(json.data?.returns || [])
    } catch (e) {
      toast.error("Failed to load returns")
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => returns, [returns])

  async function runAction(id: string, action: string, payload?: any) {
    try {
      const res = await fetch(`/api/admin/returns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
      })
      if (!res.ok) throw new Error("failed")
      toast.success("Updated")
      await load()
    } catch {
      toast.error("Action failed")
    }
  }

  function openApprove(id: string) {
    setApproveId(id)
    setForm({ restockFee: "", shippingCost: "", returnLabel: "" })
    setDialogOpen(true)
  }

  function formatMoney(v: string) { return format(Number(v || 0)) }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Returns</h1>
          <p className="text-muted-foreground">Manage customer return requests</p>
        </div>
        <div className="flex gap-2">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="received">Received</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={load} disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}</Button>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Return Requests</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Refund</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{r.id.slice(0,8)}</TableCell>
                  <TableCell className="font-mono text-xs">{r.orderId.slice(0,8)}</TableCell>
                  <TableCell>{new Date(r.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{formatMoney(r.refundAmount)}</TableCell>
                  <TableCell>
                    <Badge variant={r.status === "pending" ? "secondary" : r.status === "rejected" ? "destructive" : "default"}>{r.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {r.status === "pending" && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => openApprove(r.id)}><ClipboardCheck className="h-4 w-4" /></Button>
                          <Button size="sm" variant="destructive" onClick={() => runAction(r.id, "reject") }><XCircle className="h-4 w-4" /></Button>
                        </>
                      )}
                      {r.status === "approved" && (
                        <Button size="sm" variant="outline" onClick={() => runAction(r.id, "mark_received") }><Truck className="h-4 w-4" /></Button>
                      )}
                      {r.status === "received" && (
                        <Button size="sm" variant="outline" onClick={() => runAction(r.id, "mark_refunded") }><RotateCcw className="h-4 w-4" /></Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Approve Return</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div>
              <label className="text-sm">Restock fee</label>
              <Input type="number" step="0.01" value={form.restockFee} onChange={e => setForm({ ...form, restockFee: e.target.value })} />
            </div>
            <div>
              <label className="text-sm">Shipping cost</label>
              <Input type="number" step="0.01" value={form.shippingCost} onChange={e => setForm({ ...form, shippingCost: e.target.value })} />
            </div>
            <div>
              <label className="text-sm">Return label URL</label>
              <Input type="url" placeholder="https://..." value={form.returnLabel} onChange={e => setForm({ ...form, returnLabel: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => { if (!approveId) return; runAction(approveId, "approve", { restockFee: Number(form.restockFee||0), shippingCost: Number(form.shippingCost||0), returnLabel: form.returnLabel || undefined }); setDialogOpen(false) }}>Approve</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
