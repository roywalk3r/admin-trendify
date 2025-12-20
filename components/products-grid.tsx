"use client"
import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import ProductCard from "./product-card"
import { Button } from "./ui/button"
import { Grid, List, Filter, SortAsc } from "lucide-react"
import { useI18n } from "@/lib/i18n/I18nProvider"
import { MobileFilterSheet } from "./mobile/mobile-filter-sheet"
import { ProductGridSkeleton } from "./mobile/product-skeleton"
import { StickyActionBar } from "./mobile/sticky-action-bar"
// Fetch from API: /api/products

type ProductsGridProps = {
  categorySlug?: string
  categoryId?: string
}

export default function ProductsGrid({ categorySlug, categoryId }: ProductsGridProps = {}) {
  const { t } = useI18n()
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
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({})

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
      const categories = categorySlug || searchParams.get("categories") || searchParams.get("category")
      const sizes = searchParams.get("sizes")
      const colors = searchParams.get("colors")
      if (minPrice) params.set("minPrice", minPrice)
      if (maxPrice) params.set("maxPrice", maxPrice)
      // Prefer explicit filter via props
      if (categoryId) params.set("categoryId", categoryId)
      else if (categories) params.set("category", categories)
      if (sizes) params.set("sizes", sizes)
      if (colors) params.set("colors", colors)
      // Apply active filters
      Object.entries(activeFilters).forEach(([key, value]) => {
        if (Array.isArray(value) && value.length > 0) {
          params.set(key, value.join(","))
        } else if (Array.isArray(value) && value.length === 2 && key === "price") {
          params.set("minPrice", String(value[0]))
          params.set("maxPrice", String(value[1]))
        }
      })
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

  // Load real filter data
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const res = await fetch('/api/filters')
        if (res.ok) {
          const data = await res.json()
          const filters = [
            {
              id: "categories",
              label: "Categories",
              type: "checkbox" as const,
              options: data.data.categories || [],
            },
            {
              id: "price",
              label: "Price Range",
              type: "range" as const,
              min: data.data.priceRange?.min || 0,
              max: data.data.priceRange?.max || 1000,
              step: 10,
            },
            {
              id: "sizes",
              label: "Sizes",
              type: "checkbox" as const,
              options: data.data.sizes || [],
            },
            {
              id: "colors",
              label: "Colors",
              type: "color" as const,
              options: data.data.colors || [],
            },
            {
              id: "brands",
              label: "Brands",
              type: "checkbox" as const,
              options: data.data.brands || [],
            },
            {
              id: "rating",
              label: "Rating",
              type: "checkbox" as const,
              options: data.data.ratings || [],
            },
          ]
          setMockFilters(filters)
        }
      } catch (error) {
        console.error('Failed to load filters:', error)
      }
    }
    loadFilters()
  }, [])

  // initial + on sort change
  useEffect(() => {
    setItems([])
    fetchProducts(1, false)
  }, [sortBy, searchParams, categorySlug, categoryId, activeFilters])

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

  const handleFilterChange = (filterId: string, value: any) => {
    setActiveFilters((prev) => ({ ...prev, [filterId]: value }))
  }

  const handleClearFilters = () => {
    setActiveFilters({})
  }

  const handleApplyFilters = () => {
    setIsFilterOpen(false)
    // Refetch will happen via useEffect
  }

  // Mock filter data - replace with actual API call
  const [mockFilters, setMockFilters] = useState<any[]>([])

  return (
    <div className="relative">
      {/* Mobile Sticky Filter/Sort Bar */}
      <div className="md:hidden sticky top-[var(--mobile-header-height)] z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between p-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFilterOpen(true)}
            className="flex-1 h-[var(--mobile-touch-target)]"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {Object.keys(activeFilters).length > 0 && (
              <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                {Object.keys(activeFilters).length}
              </span>
            )}
          </Button>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as any)}
            className="flex-1 h-[var(--mobile-touch-target)] px-3 border rounded-lg text-sm bg-background"
          >
            <option value="featured">{t("products.featured")}</option>
            <option value="price-low">{t("products.priceLow")}</option>
            <option value="price-high">{t("products.priceHigh")}</option>
            <option value="name-asc">{t("products.nameAsc")}</option>
            <option value="name-desc">{t("products.nameDesc")}</option>
          </select>
        </div>
      </div>

      {/* Desktop Toolbar */}
      <div className="hidden md:flex items-center justify-between mb-6 p-4 bg-card rounded-2xl border">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {loading ? t("products.loading") : `${t("products.showingLabel")} ${items.length} ${t("products.of")} ${total} ${t("common.products")}`}
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
            <option value="featured">{t("products.featured")}</option>
            <option value="price-low">{t("products.priceLow")}</option>
            <option value="price-high">{t("products.priceHigh")}</option>
            <option value="name-asc">{t("products.nameAsc")}</option>
            <option value="name-desc">{t("products.nameDesc")}</option>
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
      {loading && items.length === 0 ? (
        <ProductGridSkeleton count={limit} />
      ) : (
        <motion.div
          className={`grid gap-4 md:gap-6 ${
            viewMode === "grid" 
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
              : "grid-cols-1"
          }`}
          layout
        >
          {items.map((product, index) => (
            <ProductCard key={`${product.id}-${index}`} {...product} index={index} />
          ))}
        </motion.div>
      )}

      {/* Load More */}
      <div className="text-center mt-8 md:mt-12">
        {items.length < total && (
          <Button
            variant="outline"
            size="lg"
            className="px-8 bg-transparent"
            disabled={loading}
            onClick={() => fetchProducts(page + 1, true)}
          >
            {loading ? t("products.loading") : t("products.loadMore")}
          </Button>
        )}
      </div>

      {/* Mobile Filter Sheet */}
      <MobileFilterSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={mockFilters}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onClearAll={handleClearFilters}
        onApply={handleApplyFilters}
      />
    </div>
  )
}
