"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Loader2, Plus, Edit2, Trash2, Truck } from "lucide-react"

interface Driver {
  id: string
  name: string
  phone: string
  email?: string | null
  licenseNo: string
  vehicleType: string
  vehicleNo: string
  isActive: boolean
  rating?: string | number | null
  totalTrips: number
  _count?: { orders: number }
}

export default function AdminDriversPage() {
  const [loading, setLoading] = useState(false)
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [search, setSearch] = useState("")
  const [active, setActive] = useState<string>("all")
  const [open, setOpen] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [editDriver, setEditDriver] = useState<Driver | null>(null)

  const filtered = useMemo(() => {
    return drivers.filter(d => {
      const matchesSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.phone.includes(search) || d.licenseNo.toLowerCase().includes(search.toLowerCase())
      const matchesActive = active === "all" || (active === "true" ? d.isActive : !d.isActive)
      return matchesSearch && matchesActive
    })
  }, [drivers, search, active])

  async function loadDrivers() {
    setLoading(true)
    try {
      const qs = new URLSearchParams()
      if (search) qs.set("search", search)
      if (active !== "all") qs.set("active", active)
      const res = await fetch(`/api/admin/drivers?${qs.toString()}`)
      const json = await res.json()
      setDrivers(json.data?.drivers || [])
    } catch (e) {
      toast.error("Failed to load drivers")
    } finally { setLoading(false) }
  }

  useEffect(() => { loadDrivers() }, [])

  function resetAndClose() {
    setEditDriver(null)
    setOpen(false)
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const payload = Object.fromEntries(fd.entries()) as any
    payload.isActive = fd.get("isActive") === "on"
    setFormLoading(true)
    try {
      const method = editDriver ? "PATCH" : "POST"
      const url = editDriver ? `/api/admin/drivers/${editDriver.id}` : "/api/admin/drivers"
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error("Request failed")
      toast.success(editDriver ? "Driver updated" : "Driver created")
      await loadDrivers()
      resetAndClose()
    } catch (e) {
      toast.error("Save failed")
    } finally { setFormLoading(false) }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this driver?")) return
    try {
      const res = await fetch(`/api/admin/drivers/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed")
      toast.success("Driver deleted")
      loadDrivers()
    } catch {
      toast.error("Delete failed")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="h-6 w-6" />
          <div>
            <h1 className="text-3xl font-bold">Drivers</h1>
            <p className="text-muted-foreground">Manage delivery drivers</p>
          </div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditDriver(null)}>
              <Plus className="h-4 w-4 mr-2" /> New Driver
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader><DialogTitle>{editDriver ? "Edit Driver" : "New Driver"}</DialogTitle></DialogHeader>
            <form className="grid gap-3" onSubmit={onSubmit}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm">Name</label>
                  <Input name="name" defaultValue={editDriver?.name || ""} required />
                </div>
                <div>
                  <label className="text-sm">Phone</label>
                  <Input name="phone" defaultValue={editDriver?.phone || ""} required />
                </div>
              </div>
              <div>
                <label className="text-sm">Email (optional)</label>
                <Input name="email" type="email" defaultValue={editDriver?.email || ""} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm">License No</label>
                  <Input name="licenseNo" defaultValue={editDriver?.licenseNo || ""} required />
                </div>
                <div>
                  <label className="text-sm">Vehicle Type</label>
                  <select name="vehicleType" defaultValue={editDriver?.vehicleType || "bike"} className="w-full border rounded h-9 px-2">
                    <option value="bike">Bike</option>
                    <option value="car">Car</option>
                    <option value="van">Van</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm">Vehicle No</label>
                <Input name="vehicleNo" defaultValue={editDriver?.vehicleNo || ""} required />
              </div>
              <div className="flex items-center gap-2">
                <input id="isActive" name="isActive" type="checkbox" defaultChecked={editDriver?.isActive ?? true} className="h-4 w-4" />
                <label htmlFor="isActive" className="text-sm">Active</label>
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <Button type="button" variant="outline" onClick={resetAndClose}>Cancel</Button>
                <Button type="submit" disabled={formLoading}>{formLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (editDriver ? "Update" : "Create")}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input placeholder="Search name, phone, license..." value={search} onChange={e => setSearch(e.target.value)} />
            <Select value={active} onValueChange={setActive}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={loadDrivers} disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>License</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Trips</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(d => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell>
                    <div className="text-sm">{d.phone}</div>
                    {d.email && <div className="text-xs text-muted-foreground">{d.email}</div>}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{d.licenseNo}</TableCell>
                  <TableCell>
                    <div className="text-sm capitalize">{d.vehicleType}</div>
                    <div className="text-xs text-muted-foreground font-mono">{d.vehicleNo}</div>
                  </TableCell>
                  <TableCell>{d.totalTrips || d._count?.orders || 0}</TableCell>
                  <TableCell>
                    <Badge variant={d.isActive ? "default" : "secondary"}>{d.isActive ? "Active" : "Inactive"}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setEditDriver(d); setOpen(true) }}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => onDelete(d.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
