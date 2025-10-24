"use client"

import { useEffect, useState } from "react"
import { useDebounce } from "@/lib/hooks/use-debounce"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Loader2, ShoppingBag, Eye } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface GuestSession {
  id: string
  sessionId: string
  email: string
  cartData: any
  createdAt: string
  expiresAt: string
}

export default function AdminGuestOrdersPage() {
  const [loading, setLoading] = useState(false)
  const [sessions, setSessions] = useState<GuestSession[]>([])
  const [search, setSearch] = useState("")
  const [selectedSession, setSelectedSession] = useState<GuestSession | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const debouncedSearch = useDebounce(search, 500)

  async function loadSessions() {
    setLoading(true)
    try {
      const qs = new URLSearchParams()
      if (debouncedSearch) qs.set("search", debouncedSearch)
      const res = await fetch(`/api/admin/guests?${qs.toString()}`)
      const json = await res.json()
      setSessions(json.data?.sessions || [])
    } catch (e) {
      toast.error("Failed to load guest sessions")
    } finally { setLoading(false) }
  }

  useEffect(() => { loadSessions() }, [debouncedSearch])

  function viewDetails(session: GuestSession) {
    setSelectedSession(session)
    setDialogOpen(true)
  }

  function formatMoney(v: number) { 
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v) 
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-6 w-6" />
          <div>
            <h1 className="text-3xl font-bold">Guest Checkouts</h1>
            <p className="text-muted-foreground">Manage guest checkout sessions and orders</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input placeholder="Search by email..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1" />
            <Button onClick={loadSessions} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Guest Sessions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Session ID</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map(s => {
                const isExpired = new Date(s.expiresAt) < new Date()
                return (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.email}</TableCell>
                    <TableCell className="font-mono text-xs">{s.sessionId.slice(0, 12)}...</TableCell>
                    <TableCell>{new Date(s.createdAt).toLocaleString()}</TableCell>
                    <TableCell>{new Date(s.expiresAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={isExpired ? "secondary" : "default"}>
                        {isExpired ? "Expired" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => viewDetails(s)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          {sessions.length === 0 && (
            <div className="text-center text-muted-foreground py-10">No guest sessions found</div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Guest Session Details</DialogTitle>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <div>{selectedSession.email}</div>
              </div>
              <div>
                <label className="text-sm font-medium">Session ID</label>
                <div className="font-mono text-xs">{selectedSession.sessionId}</div>
              </div>
              <div>
                <label className="text-sm font-medium">Cart Data</label>
                <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-60">
                  {JSON.stringify(selectedSession.cartData, null, 2)}
                </pre>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Created</label>
                  <div>{new Date(selectedSession.createdAt).toLocaleString()}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Expires</label>
                  <div>{new Date(selectedSession.expiresAt).toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
