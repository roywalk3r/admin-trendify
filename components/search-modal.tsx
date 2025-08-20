"use client"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X, TrendingUp } from "lucide-react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import Image from "next/image"

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  type SearchProduct = {
    id: string
    name: string
    price: number
    images?: string[]
  }
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const trendingSearches = ["Summer Dress", "Leather Jacket", "Sneakers", "Handbag", "Sunglasses"]

  useEffect(() => {
    if (searchQuery.length <= 2) {
      // Reset results for short queries
      setSearchResults([])
      setIsSearching(false)
      setError(null)
      // Cancel any in-flight request
      if (abortRef.current) abortRef.current.abort()
      return
    }

    setIsSearching(true)
    setError(null)

    const controller = new AbortController()
    abortRef.current = controller

    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ search: searchQuery, limit: "6" })
        const res = await fetch(`/api/products?${params.toString()}`, {
          signal: controller.signal,
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

        const products: SearchProduct[] = json?.data?.products?.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          images: p.images,
        })) || []

        setSearchResults(products)
      } catch (e: any) {
        if (e?.name === "AbortError") return
        setError(e?.message || "Something went wrong")
      } finally {
        setIsSearching(false)
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
              />
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="max-h-96 overflow-y-auto">
              {searchQuery.length === 0 && (
                <div className="p-6">
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
                </div>
              )}

              {isSearching && (
                <div className="p-6 text-center">
                  <div className="animate-spin w-6 h-6 border-2 border-ascent border-t-transparent rounded-full mx-auto" />
                  <p className="text-sm text-muted-foreground mt-2">Searching...</p>
                </div>
              )}

              {error && !isSearching && (
                <div className="p-6 text-center">
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              )}

              {searchQuery.length > 2 && !isSearching && searchResults.length === 0 && (
                <div className="p-6 text-center">
                  <p className="text-muted-foreground">No products found for "{searchQuery}"</p>
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="p-4">
                  <p className="text-sm text-muted-foreground mb-4">Found {searchResults.length} products</p>
                  <div className="space-y-3">
                    {searchResults.slice(0, 6).map((product) => (
                      <motion.div
                        key={product.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                        onClick={onClose}
                      >
                        <Image
                          src={(product.images && product.images[0]) || "/placeholder.svg"}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm line-clamp-1">{product.name}</h4>
                          <p className="text-ascent font-semibold">${product.price}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
