"use client"
import { useEffect, useMemo, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Star, Search } from "lucide-react"

export default function SearchPage() {
  const params = useSearchParams()
  const router = useRouter()
  const initialQ = params.get("q") || ""
  const [q, setQ] = useState(initialQ)
  const pageParam = parseInt(params.get("page") || "1", 10)
  const [page, setPage] = useState(Math.max(pageParam, 1))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<{ products: any[]; total: number; page: number; pageSize: number } | null>(null)
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  // Filters
  const [category, setCategory] = useState<string>(params.get("category") || "")
  const [min, setMin] = useState<string>(params.get("min") || "")
  const [max, setMax] = useState<string>(params.get("max") || "")
  const [inStock, setInStock] = useState<boolean>((params.get("inStock") || "").toLowerCase() === "true")

  const pageSize = useMemo(() => 12, [])

  // Fire-and-forget analytics logger
  const logSearchEvent = (payload: { query: string; resultCount?: number; aiSuggested?: boolean; clickedSuggestion?: string | null; source?: string }) => {
    try {
      fetch("/api/analytics/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: payload.query,
          resultCount: payload.resultCount ?? 0,
          aiSuggested: payload.aiSuggested ?? false,
          clickedSuggestion: payload.clickedSuggestion ?? null,
          source: payload.source || "page",
        }),
        keepalive: true,
      }).catch(() => {})
    } catch {}
  }

  useEffect(() => {
    const controller = new AbortController()
    const fetchData = async () => {
      if (!q || q.length < 2) {
        setData({ products: [], total: 0, page: 1, pageSize })
        return
      }
      setLoading(true)
      setError(null)
      try {
        const sp = new URLSearchParams()
        sp.set("q", q)
        sp.set("page", String(page))
        sp.set("pageSize", String(pageSize))
        if (category) sp.set("category", category)
        if (min) sp.set("min", min)
        if (max) sp.set("max", max)
        if (inStock) sp.set("inStock", "true")
        const res = await fetch(`/api/search/query?${sp.toString()}`, { signal: controller.signal, cache: "no-store" })
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || `Failed (${res.status})`)
        setData(json.data)
        // Log search fetch result count
        logSearchEvent({ query: q, resultCount: json?.data?.total ?? 0, source: "page" })
      } catch (e: any) {
        if (e?.name !== "AbortError") setError(e?.message || "Something went wrong")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    return () => controller.abort()
  }, [q, page, pageSize, category, min, max, inStock])

  useEffect(() => {
    // Keep URL in sync
    const sp = new URLSearchParams()
    if (q) sp.set("q", q)
    if (page > 1) sp.set("page", String(page))
    if (category) sp.set("category", category)
    if (min) sp.set("min", min)
    if (max) sp.set("max", max)
    if (inStock) sp.set("inStock", "true")
    router.replace(`/search?${sp.toString()}`)
  }, [q, page, category, min, max, inStock, router])

  const askAI = async () => {
    try {
      const res = await fetch("/api/search/assist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ q }) })
      const json = await res.json()
      setAiSuggestions(json?.data?.suggestions || [])
      logSearchEvent({ query: q, resultCount: data?.total ?? 0, aiSuggested: true, source: "page" })
    } catch {
      setAiSuggestions([])
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-4">
        <Search className="w-5 h-5 text-muted-foreground" />
        <h1 className="text-xl font-semibold">Search results</h1>
      </div>
      <div className="flex flex-col gap-3 mb-6">
        {/* Query row */}
        <div className="flex gap-2">
          <input
            className="w-full border rounded-md px-3 py-2 bg-background"
            placeholder="Search products..."
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1) }}
          />
          <button className="px-3 py-2 rounded-md bg-ascent text-white" onClick={() => setPage(1)}>Search</button>
        </div>

        {/* Filters row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            className="border rounded-md px-3 py-2 bg-background"
            placeholder="Category (name or slug)"
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1) }}
          />
          <div className="flex gap-2">
            <input
              className="w-full border rounded-md px-3 py-2 bg-background"
              placeholder="Min price"
              inputMode="numeric"
              value={min}
              onChange={(e) => { setMin(e.target.value.replace(/[^0-9.]/g, "")); setPage(1) }}
            />
            <input
              className="w-full border rounded-md px-3 py-2 bg-background"
              placeholder="Max price"
              inputMode="numeric"
              value={max}
              onChange={(e) => { setMax(e.target.value.replace(/[^0-9.]/g, "")); setPage(1) }}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={inStock}
              onChange={(e) => { setInStock(e.target.checked); setPage(1) }}
            />
            In stock only
          </label>
        </div>
      </div>

      {q && (
        <div className="mb-4 text-sm text-muted-foreground">Showing results for "{q}"</div>
      )}

      {loading && (
        <div className="space-y-3">
          <div className="h-20 bg-muted/60 rounded-md" />
          <div className="h-20 bg-muted/60 rounded-md" />
          <div className="h-20 bg-muted/60 rounded-md" />
        </div>
      )}

      {error && <div className="text-red-500">{error}</div>}

      {!loading && data && (
        <>
          {data.total === 0 ? (
            <div className="text-center text-muted-foreground">
              <p>No results. Try adjusting your query.</p>
              <div className="mt-4">
                <button className="text-ascent hover:underline" onClick={askAI}>Ask AI for better queries</button>
              </div>
              {aiSuggestions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2 justify-center">
                  {aiSuggestions.map((s) => (
                    <button key={s} className="px-3 py-1 rounded-full bg-muted hover:bg-ascent hover:text-white text-sm" onClick={() => setQ(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.products.map((p) => (
                  <Link key={p.id} href={`/products/${p.slug || p.id}`} className="group border rounded-lg p-3 hover:shadow-sm">
                    <div className="flex gap-3">
                      <Image src={p.image} alt={p.name} width={96} height={96} className="rounded-md object-cover" />
                      <div className="flex-1">
                        <div className="font-medium group-hover:underline line-clamp-1">{p.name}</div>
                        <div className="text-ascent font-semibold">${p.price}</div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          {p.category && <span className="px-2 py-0.5 rounded-full bg-muted-foreground/10">{p.category}</span>}
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current text-ascent" />
                            <span>{(p.averageRating ?? 0).toFixed(1)}</span>
                            <span>({p.reviewCount ?? 0})</span>
                          </span>
                        </div>
                        {p.shortDesc && <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{p.shortDesc}</p>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  className="px-3 py-1 rounded-md border disabled:opacity-50"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                <span className="text-sm text-muted-foreground">Page {page} of {Math.max(1, Math.ceil(data.total / (data.pageSize || pageSize)))}</span>
                <button
                  className="px-3 py-1 rounded-md border disabled:opacity-50"
                  disabled={page >= Math.ceil(data.total / (data.pageSize || pageSize))}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
