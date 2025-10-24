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
import { Loader2, Plus, Edit2, Trash2 } from "lucide-react"

interface Coupon {
  id: string
  code: string
  type: "percentage" | "fixed_amount"
  value: string | number
  minPurchase?: string | number | null
  maxDiscount?: string | number | null
  productId?: string | null
  categoryId?: string | null
  product?: { id: string; name: string } | null
  category?: { id: string; name: string } | null
  startDate: string
  endDate: string
  usageLimit?: number | null
  usageCount: number
  isActive: boolean
  createdAt: string
}

export default function AdminCouponsPage() {
  const [loading, setLoading] = useState(false)
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [search, setSearch] = useState("")
  const [active, setActive] = useState<string>("all")
  const [open, setOpen] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [editCoupon, setEditCoupon] = useState<Coupon | null>(null)
  const [products, setProducts] = useState<Array<{id: string; name: string}>>([])
  const [categories, setCategories] = useState<Array<{id: string; name: string}>>([])

  const filtered = useMemo(() => {
    return coupons.filter(c => {
      const matchesSearch = !search || c.code.toLowerCase().includes(search.toLowerCase())
      const matchesActive = active === "all" || (active === "true" ? c.isActive : !c.isActive)
      return matchesSearch && matchesActive
    })
  }, [coupons, search, active])

  async function loadCoupons() {
    setLoading(true)
    try {
      const qs = new URLSearchParams()
      if (search) qs.set("search", search)
      if (active !== "all") qs.set("active", active)
      const res = await fetch(`/api/admin/coupons?${qs.toString()}`)
      const json = await res.json()
      setCoupons(json.data?.coupons || [])
    } catch (e) {
      toast.error("Failed to load coupons")
    } finally { setLoading(false) }
  }

  async function loadProducts() {
    try {
      const res = await fetch("/api/admin/products?limit=200")
      const json = await res.json()
      setProducts((json.products || []).map((p: any) => ({ id: p.id, name: p.name })))
    } catch {}
  }

  async function loadCategories() {
    try {
      const res = await fetch("/api/categories")
      const json = await res.json()
      const list = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : []
      setCategories(list.map((c: any) => ({ id: c.id, name: c.name })))
    } catch {}
  }

  useEffect(() => { loadCoupons(); loadProducts(); loadCategories() }, [])

  function resetAndClose() {
    setEditCoupon(null)
    setOpen(false)
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const payload = Object.fromEntries(fd.entries()) as any
    
    // Convert numeric fields
    payload.value = Number(payload.value)
    if (payload.minPurchase) payload.minPurchase = Number(payload.minPurchase)
    if (payload.maxDiscount) payload.maxDiscount = Number(payload.maxDiscount)
    if (payload.usageLimit) payload.usageLimit = Number(payload.usageLimit)
    
    // Handle optional fields
    if (!payload.productId || payload.productId === "") payload.productId = null
    if (!payload.categoryId || payload.categoryId === "") payload.categoryId = null
    
    // Fix checkbox - FormData returns "on" for checked checkboxes, not true/false
    payload.isActive = fd.get("isActive") === "on"
    
    setFormLoading(true)
    try {
      const method = editCoupon ? "PATCH" : "POST"
      const url = editCoupon ? `/api/admin/coupons/${editCoupon.id}` : "/api/admin/coupons"
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Request failed")
      }
      toast.success(editCoupon ? "Coupon updated" : "Coupon created")
      await loadCoupons()
      resetAndClose()
    } catch (e: any) {
      toast.error(e.message || "Save failed")
    } finally { setFormLoading(false) }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this coupon?")) return
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed")
      toast.success("Coupon deleted")
      loadCoupons()
    } catch {
      toast.error("Delete failed")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Coupons</h1>
          <p className="text-muted-foreground">Create and manage discount codes</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditCoupon(null)}>
              <Plus className="h-4 w-4 mr-2" /> New Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader><DialogTitle>{editCoupon ? "Edit Coupon" : "New Coupon"}</DialogTitle></DialogHeader>
            <form className="grid gap-3" onSubmit={onSubmit}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm">Code</label>
                  <Input name="code" defaultValue={editCoupon?.code || ""} required />
                </div>
                <div>
                  <label className="text-sm">Type</label>
                  <select name="type" defaultValue={editCoupon?.type || "percentage"} className="w-full border rounded h-9 px-2">
                    <option value="percentage">Percentage</option>
                    <option value="fixed_amount">Fixed Amount</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm">Product (optional)</label>
                  <select name="productId" defaultValue={editCoupon?.productId || ""} className="w-full border rounded h-9 px-2">
                    <option value="">All Products</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm">Category (optional)</label>
                  <select name="categoryId" defaultValue={editCoupon?.categoryId || ""} className="w-full border rounded h-9 px-2">
                    <option value="">All Categories</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm">Value</label>
                  <Input name="value" type="number" step="0.01" defaultValue={editCoupon?.value as any || ""} required />
                </div>
                <div>
                  <label className="text-sm">Usage Limit</label>
                  <Input name="usageLimit" type="number" defaultValue={editCoupon?.usageLimit ?? ""} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm">Min Purchase</label>
                  <Input name="minPurchase" type="number" step="0.01" defaultValue={editCoupon?.minPurchase as any ?? ""} />
                </div>
                <div>
                  <label className="text-sm">Max Discount</label>
                  <Input name="maxDiscount" type="number" step="0.01" defaultValue={editCoupon?.maxDiscount as any ?? ""} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm">Start Date</label>
                  <Input name="startDate" type="date" defaultValue={editCoupon ? editCoupon.startDate.substring(0,10) : ""} required />
                </div>
                <div>
                  <label className="text-sm">End Date</label>
                  <Input name="endDate" type="date" defaultValue={editCoupon ? editCoupon.endDate.substring(0,10) : ""} required />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input id="isActive" name="isActive" type="checkbox" defaultChecked={editCoupon?.isActive ?? true} className="h-4 w-4" />
                <label htmlFor="isActive" className="text-sm">Active</label>
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <Button type="button" variant="outline" onClick={resetAndClose}>Cancel</Button>
                <Button type="submit" disabled={formLoading}>{formLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (editCoupon ? "Update" : "Create")}</Button>
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
            <Input placeholder="Search code..." value={search} onChange={e => setSearch(e.target.value)} />
            <Select value={active} onValueChange={setActive}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={loadCoupons} disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Validity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono">{c.code}</TableCell>
                  <TableCell>{c.type === "percentage" ? "%" : "Fixed"}</TableCell>
                  <TableCell>{c.value}</TableCell>
                  <TableCell>
                    {c.product ? <Badge variant="outline">{c.product.name}</Badge> : 
                     c.category ? <Badge variant="outline">{c.category.name}</Badge> : 
                     <span className="text-xs text-muted-foreground">Global</span>}
                  </TableCell>
                  <TableCell>{c.usageCount}{c.usageLimit ? ` / ${c.usageLimit}` : ""}</TableCell>
                  <TableCell>{new Date(c.startDate).toLocaleDateString()} → {new Date(c.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={c.isActive ? "default" : "secondary"}>{c.isActive ? "Active" : "Inactive"}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setEditCoupon(c); setOpen(true) }}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => onDelete(c.id)}>
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
