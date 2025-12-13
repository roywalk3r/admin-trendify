"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { useDebounce } from "@/lib/hooks/use-debounce"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, Star, Check, X, Trash2, MessageSquare } from "lucide-react"
import Image from "next/image"

interface Review {
  id: string
  rating: number
  title?: string
  comment?: string
  isApproved: boolean
  isVerified: boolean
  createdAt: string
  user: { id: string; name?: string; email: string }
  product: { id: string; name: string; images: string[] }
}

interface Stats {
  pending: number
  approved: number
  total: number
}

export default function AdminReviewsPage() {
  const [loading, setLoading] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<string>("pending")
  const [selectedReviews, setSelectedReviews] = useState<string[]>([])
  const debouncedSearch = useDebounce(search, 500)

  const loadReviews = useCallback(async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams()
      if (debouncedSearch) qs.set("search", debouncedSearch)
      if (status !== "all") qs.set("status", status)
      const res = await fetch(`/api/admin/reviews?${qs.toString()}`)
      const json = await res.json()
      setReviews(json.data?.reviews || [])
      setStats(json.data?.stats || null)
    } catch (e) {
      toast.error("Failed to load reviews")
    } finally { setLoading(false) }
  }, [debouncedSearch, status])

  useEffect(() => { loadReviews() }, [loadReviews])

  const handleBulkAction = async (action: "approve" | "reject" | "delete") => {
    if (selectedReviews.length === 0) {
      toast.error("Please select reviews first")
      return
    }
    if (!confirm(`${action} ${selectedReviews.length} reviews?`)) return
    
    try {
      await Promise.all(
        selectedReviews.map(id => 
          fetch(`/api/admin/reviews/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action })
          })
        )
      )
      toast.success(`Bulk ${action} completed`)
      setSelectedReviews([])
      loadReviews()
    } catch {
      toast.error("Bulk action failed")
    }
  }

  const handleAction = async (id: string, action: "approve" | "reject" | "delete") => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      })
      if (!res.ok) throw new Error("Action failed")
      toast.success(`Review ${action}d`)
      loadReviews()
    } catch {
      toast.error("Action failed")
    }
  }

  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`h-3 w-3 ${i <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6" />
          <div>
            <h1 className="text-3xl font-bold">Review Moderation</h1>
            <p className="text-muted-foreground">Approve, reject, or delete product reviews</p>
          </div>
        </div>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">Awaiting moderation</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <Check className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approved}</div>
              <p className="text-xs text-muted-foreground">Published reviews</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">All reviews</p>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedReviews.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {selectedReviews.length} review(s) selected
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleBulkAction("approve")}>
                  <Check className="h-4 w-4 mr-1" /> Approve All
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction("reject")}>
                  <X className="h-4 w-4 mr-1" /> Reject All
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleBulkAction("delete")}>
                  <Trash2 className="h-4 w-4 mr-1" /> Delete All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input placeholder="Search reviews..." value={search} onChange={e => setSearch(e.target.value)} />
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={loadReviews} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input 
                    type="checkbox" 
                    checked={selectedReviews.length === reviews.length && reviews.length > 0}
                    onChange={(e) => setSelectedReviews(e.target.checked ? reviews.map(r => r.id) : [])}
                    className="h-4 w-4"
                  />
                </TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map(r => (
                <TableRow key={r.id}>
                  <TableCell>
                    <input 
                      type="checkbox" 
                      checked={selectedReviews.includes(r.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedReviews([...selectedReviews, r.id])
                        } else {
                          setSelectedReviews(selectedReviews.filter(id => id !== r.id))
                        }
                      }}
                      className="h-4 w-4"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-muted rounded overflow-hidden">
                        {r.product.images[0] && (
                          <Image src={r.product.images[0]} alt={r.product.name} width={40} height={40} className="object-cover" />
                        )}
                      </div>
                      <div className="text-sm">{r.product.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {r.title && <div className="font-medium text-sm">{r.title}</div>}
                    {r.comment && <div className="text-xs text-muted-foreground line-clamp-2">{r.comment}</div>}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{r.user.name || r.user.email}</div>
                    {r.isVerified && <Badge variant="outline" className="text-xs">Verified Purchase</Badge>}
                  </TableCell>
                  <TableCell><StarRating rating={r.rating} /></TableCell>
                  <TableCell className="text-sm">{new Date(r.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={r.isApproved ? "default" : "secondary"}>
                      {r.isApproved ? "Approved" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {!r.isApproved && (
                        <Button size="sm" variant="outline" onClick={() => handleAction(r.id, "approve")}>
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                      {r.isApproved && (
                        <Button size="sm" variant="outline" onClick={() => handleAction(r.id, "reject")}>
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                      <Button size="sm" variant="destructive" onClick={() => handleAction(r.id, "delete")}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {reviews.length === 0 && (
            <div className="text-center text-muted-foreground py-10">No reviews found</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
