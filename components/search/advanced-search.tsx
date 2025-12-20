"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Filter, X, Star, DollarSign, Tag, Grid, List } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useRouter, useSearchParams } from "next/navigation"
import { useI18n } from "@/lib/i18n/I18nProvider"
import { useCurrency } from "@/lib/contexts/settings-context"

interface SearchFilters {
  query: string
  category: string[]
  priceRange: [number, number]
  rating: number
  inStock: boolean
  tags: string[]
  sortBy: string
  viewMode: 'grid' | 'list'
}

interface SearchResult {
  id: string
  name: string
  price: number
  comparePrice?: number
  rating: number
  reviews: number
  image: string
  category: string
  tags: string[]
  inStock: boolean
  isNew?: boolean
  isSale?: boolean
}

interface AdvancedSearchProps {
  onSearch?: (filters: SearchFilters, results: SearchResult[]) => void
  placeholder?: string
  className?: string
}

export default function AdvancedSearch({ 
  onSearch, 
  placeholder = "Search products...",
  className 
}: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    category: [],
    priceRange: [0, 1000],
    rating: 0,
    inStock: false,
    tags: [],
    sortBy: "relevance",
    viewMode: 'grid'
  })
  
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)

  const isMobile = useMediaQuery("(max-width: 768px)")
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useI18n()
  const { format } = useCurrency()

  // Categories and tags data (in real app, fetch from API)
  const categories = [
    { id: "clothing", label: "Clothing", count: 150 },
    { id: "accessories", label: "Accessories", count: 75 },
    { id: "shoes", label: "Shoes", count: 120 },
    { id: "electronics", label: "Electronics", count: 90 },
    { id: "home", label: "Home & Garden", count: 60 }
  ]

  const popularTags = [
    { id: "trending", label: "Trending", count: 45 },
    { id: "new-arrival", label: "New Arrival", count: 30 },
    { id: "bestseller", label: "Bestseller", count: 25 },
    { id: "limited-edition", label: "Limited Edition", count: 15 },
    { id: "eco-friendly", label: "Eco Friendly", count: 20 }
  ]

  const sortOptions = [
    { value: "relevance", label: "Most Relevant" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "rating", label: "Highest Rated" },
    { value: "newest", label: "Newest First" },
    { value: "popularity", label: "Most Popular" }
  ]

  // Calculate active filters count
  useEffect(() => {
    let count = 0
    if (filters.query) count++
    if (filters.category.length > 0) count++
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) count++
    if (filters.rating > 0) count++
    if (filters.inStock) count++
    if (filters.tags.length > 0) count++
    setActiveFiltersCount(count)
  }, [filters])

  // Load initial state from URL params
  useEffect(() => {
    const query = searchParams.get('q') || ""
    const category = searchParams.get('category')?.split(',').filter(Boolean) || []
    const minPrice = parseInt(searchParams.get('minPrice') || "0")
    const maxPrice = parseInt(searchParams.get('maxPrice') || "1000")
    const rating = parseInt(searchParams.get('rating') || "0")
    const inStock = searchParams.get('inStock') === 'true'
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || []
    const sortBy = searchParams.get('sort') || "relevance"

    setFilters(prev => ({
      ...prev,
      query,
      category,
      priceRange: [minPrice, maxPrice],
      rating,
      inStock,
      tags,
      sortBy
    }))

    if (query) {
      performSearch({ ...filters, query, category, priceRange: [minPrice, maxPrice], rating, inStock, tags, sortBy })
    }
  }, [searchParams])

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  // Debounced search function
  const debouncedSearch = useMemo(() => {
    let timeout: NodeJS.Timeout
    return (searchFilters: SearchFilters) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        performSearch(searchFilters)
      }, 300)
    }
  }, [])

  const performSearch = async (searchFilters: SearchFilters) => {
    if (!searchFilters.query && activeFiltersCount === 0) {
      setResults([])
      return
    }

    setIsLoading(true)
    
    try {
      const params = new URLSearchParams()
      if (searchFilters.query) params.set('q', searchFilters.query)
      if (searchFilters.category.length) params.set('category', searchFilters.category.join(','))
      if (searchFilters.priceRange[0] > 0) params.set('minPrice', searchFilters.priceRange[0].toString())
      if (searchFilters.priceRange[1] < 1000) params.set('maxPrice', searchFilters.priceRange[1].toString())
      if (searchFilters.rating > 0) params.set('rating', searchFilters.rating.toString())
      if (searchFilters.inStock) params.set('inStock', 'true')
      if (searchFilters.tags.length) params.set('tags', searchFilters.tags.join(','))
      if (searchFilters.sortBy !== 'relevance') params.set('sort', searchFilters.sortBy)

      // Update URL without page reload
      router.push(`/search?${params.toString()}`, { scroll: false })

      // Perform API search
      const response = await fetch(`/api/search?${params.toString()}`)
      const data = await response.json()
      
      setResults(data.results || [])
      
      // Save to recent searches
      if (searchFilters.query && !recentSearches.includes(searchFilters.query)) {
        const newRecent = [searchFilters.query, ...recentSearches.slice(0, 4)]
        setRecentSearches(newRecent)
        localStorage.setItem('recentSearches', JSON.stringify(newRecent))
      }

      onSearch?.(searchFilters, data.results || [])
    } catch (error) {
      console.error('Search failed:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    debouncedSearch(newFilters)
  }

  const toggleCategory = (categoryId: string) => {
    const newCategories = filters.category.includes(categoryId)
      ? filters.category.filter(c => c !== categoryId)
      : [...filters.category, categoryId]
    updateFilter('category', newCategories)
  }

  const toggleTag = (tagId: string) => {
    const newTags = filters.tags.includes(tagId)
      ? filters.tags.filter(t => t !== tagId)
      : [...filters.tags, tagId]
    updateFilter('tags', newTags)
  }

  const clearFilters = () => {
    const clearedFilters: SearchFilters = {
      query: "",
      category: [],
      priceRange: [0, 1000],
      rating: 0,
      inStock: false,
      tags: [],
      sortBy: "relevance",
      viewMode: filters.viewMode
    }
    setFilters(clearedFilters)
    setResults([])
    router.push('/search')
  }

  const fetchSuggestions = async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([])
      return
    }

    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      setSuggestions(data.suggestions || [])
    } catch (error) {
      setSuggestions([])
    }
  }

  // Filter panel component
  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Categories</Label>
        <div className="space-y-2">
          {categories.map(category => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={category.id}
                checked={filters.category.includes(category.id)}
                onCheckedChange={() => toggleCategory(category.id)}
              />
              <Label htmlFor={category.id} className="flex-1 cursor-pointer">
                {category.label}
              </Label>
              <Badge variant="outline" className="text-xs">
                {category.count}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <Label className="text-sm font-medium mb-3 block">
          Price Range: {format(filters.priceRange[0])} - {format(filters.priceRange[1])}
        </Label>
        <Slider
          value={filters.priceRange}
          onValueChange={(value) => updateFilter('priceRange', value)}
          max={1000}
          step={10}
          className="w-full"
        />
      </div>

      {/* Rating */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Minimum Rating</Label>
        <div className="flex space-x-2">
          {[1, 2, 3, 4, 5].map(rating => (
            <Button
              key={rating}
              variant={filters.rating >= rating ? "default" : "outline"}
              size="sm"
              onClick={() => updateFilter('rating', rating)}
              className="p-1"
            >
              <Star className="h-4 w-4" />
            </Button>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="inStock"
          checked={filters.inStock}
          onCheckedChange={(checked) => updateFilter('inStock', checked)}
        />
        <Label htmlFor="inStock">In Stock Only</Label>
      </div>

      {/* Tags */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Tags</Label>
        <div className="flex flex-wrap gap-2">
          {popularTags.map(tag => (
            <Badge
              key={tag.id}
              variant={filters.tags.includes(tag.id) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleTag(tag.id)}
            >
              {tag.label}
              <span className="ml-1 text-xs">({tag.count})</span>
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            type="text"
            placeholder={placeholder}
            value={filters.query}
            onChange={(e) => {
              updateFilter('query', e.target.value)
              fetchSuggestions(e.target.value)
            }}
            className="pl-10 pr-12"
          />
          {filters.query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateFilter('query', "")}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Suggestions Dropdown */}
        <AnimatePresence>
          {(suggestions.length > 0 || recentSearches.length > 0) && filters.query && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border rounded-md shadow-lg max-h-64 overflow-y-auto"
            >
              {suggestions.length > 0 && (
                <div className="p-2">
                  <div className="text-xs text-muted-foreground mb-2">Suggestions</div>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="w-full text-left px-2 py-1 hover:bg-accent rounded text-sm"
                      onClick={() => {
                        updateFilter('query', suggestion)
                        setSuggestions([])
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
              
              {recentSearches.length > 0 && (
                <div className="p-2 border-t">
                  <div className="text-xs text-muted-foreground mb-2">Recent Searches</div>
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      className="w-full text-left px-2 py-1 hover:bg-accent rounded text-sm"
                      onClick={() => {
                        updateFilter('query', search)
                        setSuggestions([])
                      }}
                    >
                      {search}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Filters and Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {/* Mobile Filter Button */}
          {isMobile ? (
            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-1" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Search Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterPanel />
                  <div className="mt-6 flex space-x-2">
                    <Button onClick={() => setShowFilters(false)} className="flex-1">
                      Apply Filters
                    </Button>
                    <Button variant="outline" onClick={clearFilters}>
                      Clear
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-1" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          )}

          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Sort */}
          <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View Mode */}
          <div className="flex border rounded-md">
            <Button
              variant={filters.viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => updateFilter('viewMode', 'grid')}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={filters.viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => updateFilter('viewMode', 'list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Filters Panel */}
      {!isMobile && showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Search Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <FilterPanel />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Results Info */}
      {(isLoading || results.length > 0) && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {isLoading ? (
              "Searching..."
            ) : (
              `${results.length} ${results.length === 1 ? 'result' : 'results'} found`
            )}
          </div>
        </div>
      )}
    </div>
  )
}
