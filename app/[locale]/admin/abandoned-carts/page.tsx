"use client"

import { useEffect, useState } from "react"
import { useDebounce } from "@/lib/hooks/use-debounce"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useCurrency } from "@/lib/contexts/settings-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, ShoppingCart, TrendingUp, DollarSign } from "lucide-react"

interface AbandonedCart {
  id: string
  email: string
  cartValue: string
  cartData: any
  remindersSent: number
  recovered: boolean
  createdAt: string
}

interface Stats {
  totalAbandoned: number
  totalValue: number
  totalRecovered: number
  recoveredValue: number
  recoveryRate: number
}

export default function AdminAbandonedCartsPage() {
  const [loading, setLoading] = useState(false)
  const [carts, setCarts] = useState<AbandonedCart[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [search, setSearch] = useState("")
  const [recovered, setRecovered] = useState<string>("all")
  const debouncedSearch = useDebounce(search, 500)

  async function loadCarts() {
    setLoading(true)
    try {
      const qs = new URLSearchParams()
      if (debouncedSearch) qs.set("search", debouncedSearch)
      if (recovered !== "all") qs.set("recovered", recovered)
      const res = await fetch(`/api/admin/abandoned-carts?${qs.toString()}`)
      const json = await res.json()
      setCarts(json.data?.carts || [])
      setStats(json.data?.stats || null)
    } catch (e) {
      toast.error("Failed to load abandoned carts")
    } finally { setLoading(false) }
  }

  useEffect(() => { loadCarts() }, [debouncedSearch, recovered])

  const { format } = useCurrency()

  function formatMoney(v: number) {
    return format(Number(v || 0))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-6 w-6" />
          <div>
            <h1 className="text-3xl font-bold">Abandoned Carts</h1>
            <p className="text-muted-foreground">Track and recover abandoned shopping carts</p>
          </div>
        </div>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Abandoned</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAbandoned}</div>
              <p className="text-xs text-muted-foreground">{formatMoney(stats.totalValue)} value</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recovered</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRecovered}</div>
              <p className="text-xs text-muted-foreground">{formatMoney(stats.recoveredValue)} recovered</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recovery Rate</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recoveryRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Conversion rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Potential Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatMoney(stats.totalValue - stats.recoveredValue)}</div>
              <p className="text-xs text-muted-foreground">Still unrecovered</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input placeholder="Search by email..." value={search} onChange={e => setSearch(e.target.value)} />
            <Select value={recovered} onValueChange={setRecovered}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="false">Not Recovered</SelectItem>
                <SelectItem value="true">Recovered</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={loadCarts} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Abandoned Carts</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Cart Value</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Reminders</TableHead>
                <TableHead>Abandoned</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {carts.map(c => {
                const items = Array.isArray(c.cartData) ? c.cartData : []
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.email}</TableCell>
                    <TableCell className="font-mono">{formatMoney(Number(c.cartValue))}</TableCell>
                    <TableCell>{items.length} items</TableCell>
                    <TableCell>{c.remindersSent}</TableCell>
                    <TableCell>{new Date(c.createdAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={c.recovered ? "default" : "secondary"}>
                        {c.recovered ? "Recovered" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {!c.recovered && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={loading}
                          onClick={async () => {
                            try {
                              const res = await fetch(`/api/admin/abandoned-carts/${c.id}`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ action: "remind" }),
                              })
                              const json = await res.json().catch(() => ({}))
                              if (!res.ok) {
                                throw new Error(json?.error || "Failed to send reminder")
                              }
                              toast.success("Reminder email sent")
                              loadCarts()
                            } catch (e) {
                              toast.error("Failed to send reminder")
                            }
                          }}
                        >
                          Send Reminder
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          {carts.length === 0 && (
            <div className="text-center text-muted-foreground py-10">No abandoned carts found</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
