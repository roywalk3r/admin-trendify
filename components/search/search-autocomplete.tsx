"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import Image from "next/image"
import Link from "next/link"
import { Search, X } from "lucide-react"

interface Suggestion {
  id: string
  name: string
  slug: string
  image: string
  price: number
  category?: string | null
  averageRating?: number
  reviewCount?: number
}

export function SearchAutocomplete() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<Suggestion[]>([])
  const abortRef = useRef<AbortController | null>(null)

  const debouncedQuery = useDebounce(query, 200)

  useEffect(() => {
    if (!debouncedQuery) {
      setItems([])
      return
    }

    setLoading(true)
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    fetch(`/api/search/suggest?q=${encodeURIComponent(debouncedQuery)}&limit=8`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        const json = await res.json().catch(() => ({}))
        const suggestions = json?.data?.suggestions || []
        setItems(suggestions)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [debouncedQuery])

  useEffect(() => {
    setOpen(Boolean(query))
  }, [query])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full">
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full pr-10"
            onFocus={() => setOpen(Boolean(query))}
          />
          {query ? (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
              onClick={() => setQuery("")}
              aria-label="Clear"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[380px]" align="start">
        <Command shouldFilter={false}>
          <CommandList>
            <CommandEmpty>{loading ? "Searching…" : "No results found"}</CommandEmpty>
            {!!items.length && (
              <CommandGroup heading="Suggestions">
                {items.map((p) => (
                  <CommandItem key={p.id} className="p-0">
                    <Link href={`/products/${p.id}`} className="flex items-center w-full gap-3 p-2">
                      <div className="relative h-10 w-10 rounded overflow-hidden bg-muted">
                        <Image src={p.image || "/placeholder.svg"} alt={p.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="truncate text-sm font-medium">{p.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {p.category ? `${p.category} • ` : ""}${Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(p.price)}
                        </div>
                      </div>
                    </Link>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

function useDebounce<T>(value: T, delay = 200) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}
