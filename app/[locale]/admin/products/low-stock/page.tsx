"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import { Loader2, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

interface Category { id: string; name: string }

interface LowStockProduct {
  id: string
  name: string
  stock: number
  lowStockAlert: number
  images: string[]
  category: { id: string; name: string }
  updatedAt: string
}

export default function LowStockPage() {
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<LowStockProduct[]>([])
  const [threshold, setThreshold] = useState<string>("")
  const [category, setCategory] = useState<string>("all")
  const [categories, setCategories] = useState<Category[]>([])

  async function load() {
    setLoading(true)
    try {
      const qs = new URLSearchParams()
      if (threshold) qs.set("threshold", threshold)
      if (category && category !== "all") qs.set("category", category)
      const res = await fetch(`/api/admin/reports/low-stock?${qs.toString()}`)
      if (!res.ok) throw new Error("Failed")
      const json = await res.json()
      setProducts(json.data?.products || [])
    } catch (e) {
      toast.error("Failed to load low stock report")
    } finally { setLoading(false) }
  }

  async function loadCategories() {
    try {
      const res = await fetch("/api/categories")
      const json = await res.json()
      const list = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : []
      setCategories(list.map((c: any) => ({ id: c.id, name: c.name })))
    } catch {}
  }

  useEffect(() => { loadCategories(); load() }, [])

  const rows = useMemo(() => products, [products])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-orange-500" />
          <div>
            <h1 className="text-3xl font-bold">Low Stock</h1>
            <p className="text-muted-foreground">Products at or below threshold</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder="Threshold (optional)" value={threshold} onChange={e => setThreshold(e.target.value)} className="w-44" />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-56"><SelectValue placeholder="All categories" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={load} disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}</Button>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Products</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Threshold</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(p => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded overflow-hidden">
                        {p.images?.[0] ? (
                          <Image src={p.images[0]} alt={p.name} width={40} height={40} className="object-cover w-10 h-10" />
                        ) : null}
                      </div>
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-muted-foreground font-mono">{p.id.slice(0,8)}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline">{p.category?.name || "-"}</Badge></TableCell>
                  <TableCell>
                    <Badge variant={p.stock === 0 ? "destructive" : "secondary"}>{p.stock}</Badge>
                  </TableCell>
                  <TableCell>{p.lowStockAlert}</TableCell>
                  <TableCell>{new Date(p.updatedAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {rows.length === 0 && (
            <div className="text-center text-muted-foreground py-10">No products at or below the threshold.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
