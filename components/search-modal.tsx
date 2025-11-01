"use client"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X, TrendingUp, Star, Sparkles } from "lucide-react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  type SearchProduct = {
    id: string
    name: string
    price: number
    images?: string[]
    category?: string | null
    averageRating?: number
    reviewCount?: number
    slug?: string
  }

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
          source: payload.source || "popup",
        }),
        keepalive: true,
      }).catch(() => {})
    } catch {}
  }

  // (moved below after state declarations)

  const askAI = async () => {
    if (!searchQuery) return
    setAiLoading(true)
    try {
      const res = await fetch("/api/search/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: searchQuery }),
      })
      const json = await res.json()
      const suggestions: string[] = json?.data?.suggestions || []
      setAiSuggestions(suggestions)
      // log AI assist event
      logSearchEvent({ query: searchQuery, resultCount: searchResults.length, aiSuggested: true, source: "popup" })
    } catch {
      setAiSuggestions([])
    } finally {
      setAiLoading(false)
    }
  }
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)
  const [history, setHistory] = useState<string[]>([])
  const maxHistory = 8
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [inHistoryFocus, setInHistoryFocus] = useState(false)
  const [historyIndex, setHistoryIndex] = useState(0)
  const historyRefs = useRef<HTMLButtonElement[]>([])
  const requestIdRef = useRef(0)
  const [lastSettledQuery, setLastSettledQuery] = useState<string>("")
  const [lastSettledHadResults, setLastSettledHadResults] = useState<boolean>(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const lastAiQueryRef = useRef<string>("")

  const trendingSearches = ["Summer Dress", "Leather Jacket", "Sneakers", "Handbag", "Sunglasses"]

  // Highlight matched query parts in suggestion text
  const renderHighlighted = (text: string, q: string) => {
    if (!q) return text
    try {
      const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")})`, "ig"))
      return (
        <>
          {parts.map((part, idx) =>
            part.toLowerCase() === q.toLowerCase() ? (
              <mark key={idx} className="bg-yellow-200 dark:bg-yellow-900/50 rounded px-0.5">
                {part}
              </mark>
            ) : (
              <span key={idx}>{part}</span>
            )
          )}
        </>
      )
    } catch {
      return text
    }
  }

  // Load history when modal opens
  useEffect(() => {
    if (!isOpen) return
    try {
      const raw = localStorage.getItem("search_history")
      setHistory(raw ? JSON.parse(raw) : [])
    } catch {
      setHistory([])
    }
    setSelectedIndex(-1)
    setInHistoryFocus(false)
  }, [isOpen])

  // Auto-ask AI for better queries when results are very low (0-3)
  useEffect(() => {
    if (!isOpen) return
    if (isSearching) return
    if (searchQuery.length < 2) return
    if (searchResults.length > 3) return
    if (aiLoading) return
    if (lastAiQueryRef.current === searchQuery) return
    // trigger in the background; keep UX responsive
    ;(async () => {
      lastAiQueryRef.current = searchQuery
      try {
        await askAI()
      } catch {}
    })()
  }, [isOpen, isSearching, searchQuery, searchResults.length, aiLoading])

  const addToHistory = (term: string) => {
    if (!term) return
    setHistory((prev) => {
      const next = [term, ...prev.filter((t) => t.toLowerCase() !== term.toLowerCase())].slice(0, maxHistory)
      try {
        localStorage.setItem("search_history", JSON.stringify(next))
      } catch {}
      return next
    })
  }

  const clearHistory = () => {
    try {
      localStorage.removeItem("search_history")
    } catch {}
    setHistory([])
  }

  useEffect(() => {
    if (searchQuery.length < 2) {
      // Reset results for short queries
      setSearchResults([])
      setIsSearching(false)
      setError(null)
      // Cancel any in-flight request
      if (abortRef.current) abortRef.current.abort()
      setSelectedIndex(-1)
      return
    }

    setIsSearching(true)
    setError(null)

    const controller = new AbortController()
    abortRef.current = controller
    const myRequestId = ++requestIdRef.current

    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: searchQuery, limit: "11" })
        const res = await fetch(`/api/search/suggest?${params.toString()}`, {
          signal: controller.signal,
          cache: "no-store",
        })

        // If aborted, exit early
        if (controller.signal.aborted) return

        const contentType = res.headers.get("content-type")
        let json: any = {}
        if (contentType && contentType.includes("application/json")) {
          const text = await res.text()
          if (text) json = JSON.parse(text)
        }

        if (!res.ok) {
          const msg = typeof json?.error === "string" ? json.error : `Search failed (${res.status})`
          throw new Error(msg)
        }

        const products: SearchProduct[] =
          json?.data?.suggestions?.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: Number(p.price),
            images: p.image ? [p.image] : [],
            category: p.category ?? null,
            averageRating: typeof p.averageRating === "number" ? p.averageRating : Number(p.averageRating ?? 0),
            reviewCount: typeof p.reviewCount === "number" ? p.reviewCount : Number(p.reviewCount ?? 0),
            slug: p.slug,
          })) || []

        // Only update if this is the latest outstanding request
        if (myRequestId === requestIdRef.current) {
          // If we have more than 10 results, redirect to the main search page
          if (products.length > 10) {
            addToHistory(searchQuery)
            onClose()
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
            return
          }
          setSearchResults(products)
          // log search event
          logSearchEvent({ query: searchQuery, resultCount: products.length, source: "popup" })
          setSelectedIndex(-1)
          setLastSettledQuery(searchQuery)
          setLastSettledHadResults(products.length > 0)
        }
      } catch (e: any) {
        if (e?.name === "AbortError") return
        // Only surface error if latest request
        if (myRequestId === requestIdRef.current) {
          setError(e?.message || "Something went wrong")
          setLastSettledQuery(searchQuery)
          setLastSettledHadResults(false)
        }
      } finally {
        // Only end loading state if latest request
        if (myRequestId === requestIdRef.current) {
          setIsSearching(false)
        }
      }
    }, 300)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [searchQuery])

  const handleTrendingClick = (term: string) => {
    setSearchQuery(term)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center pt-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-2xl mx-4 bg-background rounded-2xl shadow-2xl overflow-hidden"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="flex items-center gap-4 p-6 border-b">
              <Search className="w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border-0 bg-transparent text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
                autoFocus
                ref={inputRef}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    // If empty query and have history, jump focus to first chip
                    if (searchQuery.length === 0 && history.length > 0) {
                      e.preventDefault()
                      setInHistoryFocus(true)
                      setHistoryIndex(0)
                      const btn = historyRefs.current[0]
                      btn?.focus()
                      return
                    }
                    e.preventDefault()
                    setSelectedIndex((prev) => {
                      const len = searchResults.length
                      if (len <= 0) return -1
                      if (prev < 0) return 0
                      return (prev + 1) % len
                    })
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault()
                    setSelectedIndex((prev) => {
                      const len = searchResults.length
                      if (len <= 0) return -1
                      if (prev < 0) return len - 1
                      return prev === 0 ? len - 1 : prev - 1
                    })
                  } else if (e.key === "Enter") {
                    const chosen = selectedIndex >= 0 ? searchResults[selectedIndex] : searchResults[0]
                    if (chosen) {
                      addToHistory(searchQuery)
                      const path = chosen.slug ? `/products/${chosen.slug}` : `/products/${chosen.id}`
                      onClose()
                      window.location.href = path
                    }
                  } else if (e.key === "Escape") {
                    onClose()
                  }
                }}
              />
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="max-h-96 overflow-y-auto">
              {searchQuery.length < 2 && (
                <div className="p-6">
                  {history.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium">Recent Searches</span>
                        <button onClick={clearHistory} className="text-xs text-muted-foreground hover:text-foreground">Clear</button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {history.map((term, i) => (
                          <button
                            key={term}
                            ref={(el) => {
                              if (el) historyRefs.current[i] = el
                            }}
                            onClick={() => {
                              setSearchQuery(term)
                              setInHistoryFocus(false)
                              setTimeout(() => inputRef.current?.focus(), 0)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "ArrowRight") {
                                e.preventDefault()
                                const next = (i + 1) % history.length
                                setHistoryIndex(next)
                                historyRefs.current[next]?.focus()
                              } else if (e.key === "ArrowLeft") {
                                e.preventDefault()
                                const prev = i === 0 ? history.length - 1 : i - 1
                                setHistoryIndex(prev)
                                historyRefs.current[prev]?.focus()
                              } else if (e.key === "ArrowUp") {
                                e.preventDefault()
                                setInHistoryFocus(false)
                                inputRef.current?.focus()
                              } else if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault()
                                setSearchQuery(term)
                                setInHistoryFocus(false)
                                setTimeout(() => inputRef.current?.focus(), 0)
                              }
                            }}
                            className="px-3 py-1 bg-muted rounded-full text-sm hover:bg-ascent hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-ascent/60"
                            tabIndex={0}
                            aria-selected={inHistoryFocus && historyIndex === i}
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-4 h-4 text-ascent" />
                    <span className="text-sm font-medium">Trending Searches</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {trendingSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => handleTrendingClick(term)}
                        className="px-3 py-1 bg-muted rounded-full text-sm hover:bg-ascent hover:text-white transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                  {searchQuery.length >= 2 && (
                    <div className="mt-4">
                      <a
                        href={`/search?q=${encodeURIComponent(searchQuery)}`}
                        className="block text-center text-sm font-medium text-ascent hover:underline"
                        onClick={onClose}
                      >
                        See all results for &quot;{searchQuery}&quot;
                      </a>
                    </div>
                  )}
                </div>
              )}

              {isSearching && (
                <div className="p-6 text-center">
                  <div className="animate-spin w-10 h-10 border-2 border-ascent border-t-transparent rounded-full mx-auto" />
                  <p className="text-sm text-muted-foreground mt-2">Searching products…</p>
                  <div className="mt-4 space-y-2">
                    <div className="h-12 rounded-md bg-muted/60" />
                    <div className="h-12 rounded-md bg-muted/60" />
                    <div className="h-12 rounded-md bg-muted/60" />
                  </div>
                </div>
              )}

              {error && !isSearching && (
                <div className="p-6 text-center">
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              )}

              {/* Results */}
              {searchQuery.length >= 2 && !isSearching && searchResults.length > 0 && (
                <div className="p-2">
                  <ul className="divide-y">
                    {searchResults.map((item, i) => (
                      <li key={item.id}>
                        <button
                          className={`w-full flex items-center gap-3 p-3 text-left hover:bg-muted/70 rounded-md transition-colors ${
                            selectedIndex === i ? "bg-muted" : ""
                          }`}
                          onMouseEnter={() => setSelectedIndex(i)}
                          onClick={() => {
                            addToHistory(searchQuery)
                            const path =  `/products/${item.id}`
                            onClose()
                            window.location.href = path
                          }}
                        >
                          <div className="relative w-12 h-12 shrink-0 rounded-md overflow-hidden bg-muted">
                            {item.images && item.images[0] ? (
                              <Image src={item.images[0]} alt={item.name} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">
                              {renderHighlighted(item.name, searchQuery)}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {item.category || ""}
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                              {typeof item.averageRating === "number" && item.reviewCount !== undefined && (
                                <span className="inline-flex items-center gap-1">
                                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                  {item.averageRating?.toFixed(1)} ({item.reviewCount})
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="shrink-0 font-medium">
                            ${item.price.toFixed(2)}
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
                <div className="p-6 text-center">
                  <p className="text-muted-foreground mb-3">No products found for &quot;{searchQuery}&quot;</p>
                  {aiSuggestions.length > 0 && (
                    <div className="mb-2 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Sparkles className="w-3 h-3 text-ascent" />
                      <span>Did you mean…</span>
                    </div>
                  )}
                  <button
                    onClick={askAI}
                    disabled={aiLoading}
                    className="px-3 py-1.5 rounded-md bg-ascent text-white disabled:opacity-50"
                  >
                    {aiLoading ? "Asking AI…" : "Ask AI for better queries"}
                  </button>
                  {aiSuggestions.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2 justify-center">
                      {aiSuggestions.map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            logSearchEvent({
                              query: searchQuery,
                              resultCount: searchResults.length,
                              aiSuggested: true,
                              clickedSuggestion: s,
                              source: "popup",
                            })
                            setSearchQuery(s)
                          }}
                          className="px-3 py-1 rounded-full bg-muted hover:bg-ascent hover:text-white text-sm"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
