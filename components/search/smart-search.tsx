"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { 
  Search, 
  Clock, 
  TrendingUp, 
  Package, 
  X,
  ArrowRight,
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"
import { debounce } from '@/lib/utils/debounce'

interface SearchSuggestion {
  id: string
  type: 'product' | 'category' | 'brand' | 'tag' | 'query'
  title: string
  subtitle?: string
  image?: string
  url: string
  highlight?: string
  popularity?: number
}

interface SearchHistory {
  query: string
  timestamp: number
  resultCount?: number
}

interface SmartSearchProps {
  className?: string
  placeholder?: string
  showHistory?: boolean
  showTrending?: boolean
  maxSuggestions?: number
  onSearch?: (query: string) => void
  autoFocus?: boolean
}

const MAX_HISTORY_ITEMS = 5
const MAX_SUGGESTIONS = 8
const DEBOUNCE_DELAY = 300

export function SmartSearch({ 
  className,
  placeholder = "Search products, brands, categories...",
  showHistory = true,
  showTrending = true,
  maxSuggestions = MAX_SUGGESTIONS,
  onSearch,
  autoFocus = false
}: SmartSearchProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [history, setHistory] = useState<SearchHistory[]>([])
  const [trending, setTrending] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory')
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory))
      } catch (error) {
        console.error('Failed to parse search history:', error)
      }
    }
  }, [])

  // Load trending searches
  useEffect(() => {
    loadTrendingSearches()
  }, [])

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setSuggestions([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`)
        if (response.ok) {
          const data = await response.json()
          setSuggestions(data.suggestions.slice(0, maxSuggestions))
        }
      } catch (error) {
        console.error('Failed to fetch suggestions:', error)
      } finally {
        setIsLoading(false)
      }
    }, DEBOUNCE_DELAY),
    [maxSuggestions]
  )

  // Handle query changes
  useEffect(() => {
    if (query.trim()) {
      debouncedSearch(query.trim())
      setSelectedIndex(-1)
    } else {
      setSuggestions([])
    }
  }, [query, debouncedSearch])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setSelectedIndex(prev => 
            prev < suggestions.length - 1 ? prev + 1 : prev
          )
          break
        case 'ArrowUp':
          event.preventDefault()
          setSelectedIndex(prev => prev > -1 ? prev - 1 : -1)
          break
        case 'Enter':
          event.preventDefault()
          if (selectedIndex >= 0 && suggestions[selectedIndex]) {
            handleSuggestionClick(suggestions[selectedIndex])
          } else if (query.trim()) {
            handleSearch(query.trim())
          }
          break
        case 'Escape':
          setIsOpen(false)
          setSelectedIndex(-1)
          inputRef.current?.blur()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, suggestions, selectedIndex, query])

  const loadTrendingSearches = async () => {
    try {
      const response = await fetch('/api/search/trending')
      if (response.ok) {
        const data = await response.json()
        setTrending(data.trending)
      }
    } catch (error) {
      console.error('Failed to load trending searches:', error)
      // Fallback trending searches
      setTrending([
        'summer collection',
        'wireless headphones',
        'running shoes',
        'smart watch',
        'yoga mat'
      ])
    }
  }

  const addToHistory = (searchQuery: string, resultCount?: number) => {
    const newHistoryItem: SearchHistory = {
      query: searchQuery,
      timestamp: Date.now(),
      resultCount
    }

    setHistory(prev => {
      const filtered = prev.filter(item => item.query !== searchQuery)
      const updated = [newHistoryItem, ...filtered].slice(0, MAX_HISTORY_ITEMS)
      localStorage.setItem('searchHistory', JSON.stringify(updated))
      return updated
    })
  }

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return

    addToHistory(searchQuery.trim())
    setIsOpen(false)
    setQuery(searchQuery.trim())
    
    if (onSearch) {
      onSearch(searchQuery.trim())
    } else {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    addToHistory(suggestion.title)
    setIsOpen(false)
    setQuery(suggestion.title)
    
    if (suggestion.type === 'query') {
      handleSearch(suggestion.title)
    } else {
      router.push(suggestion.url)
    }
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('searchHistory')
  }

  const getIconForType = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'product':
        return <Package className="w-4 h-4" />
      case 'category':
        return <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded" />
      case 'brand':
        return <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-teal-500 rounded" />
      case 'tag':
        return <Badge variant="secondary" className="text-xs">Tag</Badge>
      default:
        return <Search className="w-4 h-4" />
    }
  }

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text
    
    const regex = new RegExp(`(${query})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-yellow-900 px-0.5 rounded">
          {part}
        </mark>
      ) : part
    )
  }

  const showDropdown = isOpen && (
    query.trim() || 
    (showHistory && history.length > 0) || 
    (showTrending && trending.length > 0)
  )

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="pl-10 pr-10"
          autoFocus={autoFocus}
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => {
              setQuery("")
              setSuggestions([])
              inputRef.current?.focus()
            }}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {showDropdown && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto">
          <CardContent className="p-0">
            {/* Loading state */}
            {isLoading && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto mb-2"></div>
                Searching...
              </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="p-2">
                <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground">
                  <Sparkles className="w-3 h-3" />
                  Suggestions
                </div>
                {suggestions.map((suggestion, index) => (
                  <div
                    key={suggestion.id}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-muted transition-colors",
                      selectedIndex === index && "bg-muted"
                    )}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {getIconForType(suggestion.type)}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {highlightMatch(suggestion.title, query)}
                      </div>
                      {suggestion.subtitle && (
                        <div className="text-xs text-muted-foreground truncate">
                          {suggestion.subtitle}
                        </div>
                      )}
                    </div>
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                  </div>
                ))}
              </div>
            )}

            {/* Recent searches */}
            {showHistory && history.length > 0 && !query && (
              <>
                {suggestions.length > 0 && <Separator />}
                <div className="p-2">
                  <div className="flex items-center justify-between px-2 py-1">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      Recent Searches
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={clearHistory}
                    >
                      Clear
                    </Button>
                  </div>
                  {history.map((item, index) => (
                    <div
                      key={`${item.query}-${item.timestamp}`}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-muted transition-colors",
                        selectedIndex === suggestions.length + index && "bg-muted"
                      )}
                      onClick={() => handleSearch(item.query)}
                    >
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="text-sm">{item.query}</div>
                        {item.resultCount && (
                          <div className="text-xs text-muted-foreground">
                            {item.resultCount} results
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Trending searches */}
            {showTrending && trending.length > 0 && !query && (
              <>
                {(suggestions.length > 0 || (showHistory && history.length > 0)) && <Separator />}
                <div className="p-2">
                  <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground">
                    <TrendingUp className="w-3 h-3" />
                    Trending Searches
                  </div>
                  <div className="flex flex-wrap gap-2 p-2">
                    {trending.map((trend, index) => (
                      <Badge
                        key={trend}
                        variant="secondary"
                        className={cn(
                          "cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors",
                          selectedIndex === suggestions.length + history.length + index && "bg-primary text-primary-foreground"
                        )}
                        onClick={() => handleSearch(trend)}
                      >
                        {trend}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* No results */}
            {!isLoading && suggestions.length === 0 && query && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No suggestions found for "{query}"
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Hook for search functionality
export function useSmartSearch() {
  const router = useRouter()
  
  const search = useCallback((query: string, filters?: Record<string, any>) => {
    const params = new URLSearchParams({ q: query })
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          params.set(key, value.join(','))
        } else if (value !== undefined && value !== null && value !== '') {
          params.set(key, value.toString())
        }
      })
    }
    
    router.push(`/products?${params.toString()}`)
  }, [router])

  const searchProducts = useCallback(async (query: string, options?: {
    category?: string
    minPrice?: number
    maxPrice?: number
    sortBy?: string
    sortOrder?: string
    page?: number
    limit?: number
  }) => {
    const params = new URLSearchParams({ q: query })
    
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.set(key, value.toString())
        }
      })
    }
    
    const response = await fetch(`/api/products/search?${params.toString()}`)
    if (!response.ok) {
      throw new Error('Search failed')
    }
    
    return response.json()
  }, [])

  return {
    search,
    searchProducts
  }
}
