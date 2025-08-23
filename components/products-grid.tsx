"use client"
import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import ProductCard from "./product-card"
import { Button } from "./ui/button"
import { Grid, List } from "lucide-react"
// Fetch from API: /api/products

export default function ProductsGrid() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  // UI sort keys mapped to API
  const [sortBy, setSortBy] = useState<
    "featured" | "price-low" | "price-high" | "name-asc" | "name-desc"
  >("featured")

  const [items, setItems] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [limit] = useState(12)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const apiSort = (key: typeof sortBy) => {
    switch (key) {
      case "price-low":
        return "price-asc"
      case "price-high":
        return "price-desc"
      case "name-asc":
        return "name-asc"
      case "name-desc":
        return "name-desc"
      // featured → default (createdAt desc) handled by API when sort is omitted
      default:
        return undefined
    }
  }

  const fetchProducts = async (targetPage: number, append = false) => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams()
      params.set("limit", String(limit))
      params.set("page", String(targetPage))
      const s = apiSort(sortBy)
      if (s) params.set("sort", s)
      // include URL-driven filters
      const minPrice = searchParams.get("minPrice")
      const maxPrice = searchParams.get("maxPrice")
      const categories = searchParams.get("categories") || searchParams.get("category")
      const sizes = searchParams.get("sizes")
      const colors = searchParams.get("colors")
      if (minPrice) params.set("minPrice", minPrice)
      if (maxPrice) params.set("maxPrice", maxPrice)
      if (categories) params.set("categories", categories)
      if (sizes) params.set("sizes", sizes)
      if (colors) params.set("colors", colors)
      const res = await fetch(`/api/products?${params.toString()}`, { cache: "no-store" })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || `Failed: ${res.status}`)
      const apiItems: any[] = json?.data?.products ?? []
      const mapped = apiItems.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        originalPrice: p.originalPrice ?? undefined,
        image: Array.isArray(p.images) && p.images.length ? p.images[0] : "/placeholder.svg",
        rating: typeof p.averageRating === "number" ? p.averageRating : 0,
        reviews: typeof p.reviewCount === "number" ? p.reviewCount : 0,
        isNew: false,
        isSale: false,
      }))
      setItems((prev) => (append ? [...prev, ...mapped] : mapped))
      setTotal(Number(json?.data?.pagination?.total || mapped.length))
      setPage(targetPage)
    } catch (e: any) {
      setError(e?.message || String(e))
    } finally {
      setLoading(false)
    }
  }

  // initial + on sort change
  useEffect(() => {
    setItems([])
    fetchProducts(1, false)
  }, [sortBy, searchParams])

  // sync sort with URL on mount and when URL changes externally
  useEffect(() => {
    const urlSort = searchParams.get("sort")
    if (!urlSort) {
      setSortBy("featured")
      return
    }
    switch (urlSort) {
      case "price-asc":
        setSortBy("price-low")
        break
      case "price-desc":
        setSortBy("price-high")
        break
      case "name-asc":
        setSortBy("name-asc")
        break
      case "name-desc":
        setSortBy("name-desc")
        break
      default:
        setSortBy("featured")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const onSortChange = (next: typeof sortBy) => {
    setSortBy(next)
    // push to URL for consistency and to enable shareable state
    const sp = new URLSearchParams(searchParams.toString())
    const mapped = apiSort(next)
    if (mapped) sp.set("sort", mapped)
    else sp.delete("sort")
    sp.delete("page")
    router.push(`${pathname}?${sp.toString()}`)
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6 p-4 bg-card rounded-2xl border">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {loading ? "Loading..." : `Showing ${items.length} of ${total} products`}
          </span>
          {error && <span className="text-sm text-destructive">{error}</span>}
        </div>

        <div className="flex items-center gap-4">
          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as any)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name-asc">Name: A → Z</option>
            <option value="name-desc">Name: Z → A</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-none"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <motion.div
        className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
        layout
      >
        {items.map((product, index) => (
          <ProductCard key={`${product.id}-${index}`} {...product} index={index} />
        ))}
      </motion.div>

      {/* Load More */}
      <div className="text-center mt-12">
        {items.length < total && (
          <Button
            variant="outline"
            size="lg"
            className="px-8 bg-transparent"
            disabled={loading}
            onClick={() => fetchProducts(page + 1, true)}
          >
            {loading ? "Loading..." : "Load More Products"}
          </Button>
        )}
      </div>
    </div>
  )
}
