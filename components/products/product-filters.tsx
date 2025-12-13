"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { 
  ChevronDown, 
  ChevronUp, 
  X, 
  Filter, 
  SlidersHorizontal,
  Search
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ProductFilter {
  categories: string[]
  colors: string[]
  sizes: string[]
  priceRange: [number, number]
  brands: string[]
  tags: string[]
  rating: number
  inStock: boolean
  onSale: boolean
}

interface ProductFiltersProps {
  className?: string
  onFiltersChange?: (filters: ProductFilter) => void
  initialFilters?: Partial<ProductFilter>
  availableFilters?: {
    categories: Array<{ id: string; name: string; count: number }>
    colors: Array<{ name: string; hex: string; count: number }>
    sizes: Array<{ name: string; count: number }>
    brands: Array<{ name: string; count: number }>
    tags: Array<{ name: string; count: number }>
    priceRange: { min: number; max: number }
  }
}

const DEFAULT_FILTERS: ProductFilter = {
  categories: [],
  colors: [],
  sizes: [],
  priceRange: [0, 1000],
  brands: [],
  tags: [],
  rating: 0,
  inStock: false,
  onSale: false
}

const COLOR_OPTIONS = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Red", hex: "#EF4444" },
  { name: "Blue", hex: "#3B82F6" },
  { name: "Green", hex: "#10B981" },
  { name: "Yellow", hex: "#F59E0B" },
  { name: "Purple", hex: "#8B5CF6" },
  { name: "Pink", hex: "#EC4899" },
  { name: "Orange", hex: "#F97316" },
  { name: "Gray", hex: "#6B7280" },
  { name: "Brown", hex: "#92400E" },
  { name: "Navy", hex: "#1E3A8A" }
]

const SIZE_OPTIONS = [
  "XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"
]

export function ProductFilters({ 
  className, 
  onFiltersChange, 
  initialFilters,
  availableFilters 
}: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState<ProductFilter>({
    ...DEFAULT_FILTERS,
    ...initialFilters
  })
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    categories: true,
    price: true,
    colors: true,
    sizes: true,
    brands: false,
    tags: false,
    rating: false
  })

  // Initialize filters from URL params
  useEffect(() => {
    const urlFilters: Partial<ProductFilter> = {}
    
    const categories = searchParams.get('categories')
    if (categories) urlFilters.categories = categories.split(',')
    
    const colors = searchParams.get('colors')
    if (colors) urlFilters.colors = colors.split(',')
    
    const sizes = searchParams.get('sizes')
    if (sizes) urlFilters.sizes = sizes.split(',')
    
    const brands = searchParams.get('brands')
    if (brands) urlFilters.brands = brands.split(',')
    
    const tags = searchParams.get('tags')
    if (tags) urlFilters.tags = tags.split(',')
    
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    if (minPrice || maxPrice) {
      urlFilters.priceRange = [
        minPrice ? parseInt(minPrice) : 0,
        maxPrice ? parseInt(maxPrice) : 1000
      ]
    }
    
    const rating = searchParams.get('rating')
    if (rating) urlFilters.rating = parseInt(rating)
    
    const inStock = searchParams.get('inStock')
    if (inStock) urlFilters.inStock = inStock === 'true'
    
    const onSale = searchParams.get('onSale')
    if (onSale) urlFilters.onSale = onSale === 'true'
    
    if (Object.keys(urlFilters).length > 0) {
      setFilters(prev => ({ ...prev, ...urlFilters }))
    }
  }, [searchParams])

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    
    if (filters.categories.length > 0) {
      params.set('categories', filters.categories.join(','))
    }
    
    if (filters.colors.length > 0) {
      params.set('colors', filters.colors.join(','))
    }
    
    if (filters.sizes.length > 0) {
      params.set('sizes', filters.sizes.join(','))
    }
    
    if (filters.brands.length > 0) {
      params.set('brands', filters.brands.join(','))
    }
    
    if (filters.tags.length > 0) {
      params.set('tags', filters.tags.join(','))
    }
    
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) {
      params.set('minPrice', filters.priceRange[0].toString())
      params.set('maxPrice', filters.priceRange[1].toString())
    }
    
    if (filters.rating > 0) {
      params.set('rating', filters.rating.toString())
    }
    
    if (filters.inStock) {
      params.set('inStock', 'true')
    }
    
    if (filters.onSale) {
      params.set('onSale', 'true')
    }
    
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`
    router.replace(newUrl, { scroll: false })
    
    onFiltersChange?.(filters)
  }, [filters, router, onFiltersChange])

  const updateFilter = <K extends keyof ProductFilter>(
    key: K, 
    value: ProductFilter[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const toggleArrayFilter = <K extends keyof ProductFilter>(
    key: K, 
    value: string
  ) => {
    setFilters(prev => {
      const currentArray = prev[key] as string[]
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value]
      return { ...prev, [key]: newArray }
    })
  }

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS)
  }

  const clearFilter = (key: keyof ProductFilter) => {
    if (key === 'priceRange') {
      setFilters(prev => ({ ...prev, [key]: [0, 1000] }))
    } else if (key === 'rating') {
      setFilters(prev => ({ ...prev, [key]: 0 }))
    } else if (key === 'inStock' || key === 'onSale') {
      setFilters(prev => ({ ...prev, [key]: false }))
    } else {
      setFilters(prev => ({ ...prev, [key]: [] }))
    }
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.categories.length > 0) count++
    if (filters.colors.length > 0) count++
    if (filters.sizes.length > 0) count++
    if (filters.brands.length > 0) count++
    if (filters.tags.length > 0) count++
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) count++
    if (filters.rating > 0) count++
    if (filters.inStock) count++
    if (filters.onSale) count++
    return count
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  return (
    <Card className={cn("sticky top-4", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5" />
            Filters
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary">{getActiveFilterCount()}</Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            disabled={getActiveFilterCount() === 0}
          >
            Clear all
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Categories */}
        <Collapsible
          open={expandedSections.categories}
          onOpenChange={() => toggleSection('categories')}
        >
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <Label className="font-semibold">Categories</Label>
              {expandedSections.categories ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-2">
            {availableFilters?.categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category.id}`}
                  checked={filters.categories.includes(category.id)}
                  onCheckedChange={() => toggleArrayFilter('categories', category.id)}
                />
                <Label
                  htmlFor={`category-${category.id}`}
                  className="text-sm cursor-pointer flex-1"
                >
                  {category.name}
                  <span className="text-muted-foreground ml-1">({category.count})</span>
                </Label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Price Range */}
        <Collapsible
          open={expandedSections.price}
          onOpenChange={() => toggleSection('price')}
        >
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <Label className="font-semibold">Price Range</Label>
              {expandedSections.price ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 mt-2">
            <div className="px-2">
              <div className="flex items-center justify-between text-sm">
                <span>${filters.priceRange[0]}</span>
                <span>${filters.priceRange[1]}</span>
              </div>
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
                max={availableFilters?.priceRange.max || 1000}
                min={availableFilters?.priceRange.min || 0}
                step={10}
                className="mt-2"
              />
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.priceRange[0]}
                onChange={(e) => updateFilter('priceRange', [parseInt(e.target.value) || 0, filters.priceRange[1]])}
                className="flex-1"
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.priceRange[1]}
                onChange={(e) => updateFilter('priceRange', [filters.priceRange[0], parseInt(e.target.value) || 1000])}
                className="flex-1"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Colors */}
        <Collapsible
          open={expandedSections.colors}
          onOpenChange={() => toggleSection('colors')}
        >
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <Label className="font-semibold">Colors</Label>
              {expandedSections.colors ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-2">
            <div className="grid grid-cols-3 gap-2">
              {COLOR_OPTIONS.map((color) => {
                const colorData = availableFilters?.colors.find(c => c.name === color.name)
                const count = colorData?.count || 0
                if (count === 0 && availableFilters) return null
                
                return (
                  <div key={color.name} className="flex items-center space-x-2">
                    <Checkbox
                      id={`color-${color.name}`}
                      checked={filters.colors.includes(color.name)}
                      onCheckedChange={() => toggleArrayFilter('colors', color.name)}
                    />
                    <Label
                      htmlFor={`color-${color.name}`}
                      className="text-sm cursor-pointer flex items-center gap-1"
                    >
                      <div
                        className="w-4 h-4 rounded border border-gray-300"
                        style={{ backgroundColor: color.hex }}
                      />
                      {color.name}
                      {count > 0 && <span className="text-muted-foreground">({count})</span>}
                    </Label>
                  </div>
                )
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Sizes */}
        <Collapsible
          open={expandedSections.sizes}
          onOpenChange={() => toggleSection('sizes')}
        >
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <Label className="font-semibold">Sizes</Label>
              {expandedSections.sizes ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-2">
            <div className="grid grid-cols-3 gap-2">
              {SIZE_OPTIONS.map((size) => {
                const sizeData = availableFilters?.sizes.find(s => s.name === size)
                const count = sizeData?.count || 0
                if (count === 0 && availableFilters) return null
                
                return (
                  <div key={size} className="flex items-center space-x-2">
                    <Checkbox
                      id={`size-${size}`}
                      checked={filters.sizes.includes(size)}
                      onCheckedChange={() => toggleArrayFilter('sizes', size)}
                    />
                    <Label
                      htmlFor={`size-${size}`}
                      className="text-sm cursor-pointer"
                    >
                      {size}
                      {count > 0 && <span className="text-muted-foreground">({count})</span>}
                    </Label>
                  </div>
                )
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Rating */}
        <Collapsible
          open={expandedSections.rating}
          onOpenChange={() => toggleSection('rating')}
        >
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <Label className="font-semibold">Rating</Label>
              {expandedSections.rating ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-2">
            {[4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center space-x-2">
                <Checkbox
                  id={`rating-${rating}`}
                  checked={filters.rating === rating}
                  onCheckedChange={() => updateFilter('rating', filters.rating === rating ? 0 : rating)}
                />
                <Label
                  htmlFor={`rating-${rating}`}
                  className="text-sm cursor-pointer flex items-center gap-1"
                >
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < rating ? "text-yellow-400" : "text-gray-300"}>
                        ★
                      </span>
                    ))}
                  </div>
                  & up
                </Label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Stock Status */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="inStock"
              checked={filters.inStock}
              onCheckedChange={(checked) => updateFilter('inStock', checked as boolean)}
            />
            <Label htmlFor="inStock" className="text-sm cursor-pointer">
              In Stock Only
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="onSale"
              checked={filters.onSale}
              onCheckedChange={(checked) => updateFilter('onSale', checked as boolean)}
            />
            <Label htmlFor="onSale" className="text-sm cursor-pointer">
              On Sale
            </Label>
          </div>
        </div>

        {/* Active Filters Summary */}
        {getActiveFilterCount() > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Active Filters</Label>
              <div className="flex flex-wrap gap-1">
                {filters.categories.map(cat => (
                  <Badge key={cat} variant="secondary" className="flex items-center gap-1">
                    {cat}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => toggleArrayFilter('categories', cat)} />
                  </Badge>
                ))}
                {filters.colors.map(color => (
                  <Badge key={color} variant="secondary" className="flex items-center gap-1">
                    {color}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => toggleArrayFilter('colors', color)} />
                  </Badge>
                ))}
                {filters.sizes.map(size => (
                  <Badge key={size} variant="secondary" className="flex items-center gap-1">
                    {size}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => toggleArrayFilter('sizes', size)} />
                  </Badge>
                ))}
                {(filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    ${filters.priceRange[0]} - ${filters.priceRange[1]}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => clearFilter('priceRange')} />
                  </Badge>
                )}
                {filters.rating > 0 && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {filters.rating}+ Stars
                    <X className="w-3 h-3 cursor-pointer" onClick={() => clearFilter('rating')} />
                  </Badge>
                )}
                {filters.inStock && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    In Stock
                    <X className="w-3 h-3 cursor-pointer" onClick={() => clearFilter('inStock')} />
                  </Badge>
                )}
                {filters.onSale && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    On Sale
                    <X className="w-3 h-3 cursor-pointer" onClick={() => clearFilter('onSale')} />
                  </Badge>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

// Hook for using filters in product pages
export function useProductFilters() {
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState<ProductFilter>(DEFAULT_FILTERS)

  useEffect(() => {
    // Parse filters from URL
    const urlFilters: Partial<ProductFilter> = {}
    
    const categories = searchParams.get('categories')
    if (categories) urlFilters.categories = categories.split(',')
    
    const colors = searchParams.get('colors')
    if (colors) urlFilters.colors = colors.split(',')
    
    const sizes = searchParams.get('sizes')
    if (sizes) urlFilters.sizes = sizes.split(',')
    
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    if (minPrice || maxPrice) {
      urlFilters.priceRange = [
        minPrice ? parseInt(minPrice) : 0,
        maxPrice ? parseInt(maxPrice) : 1000
      ]
    }
    
    const rating = searchParams.get('rating')
    if (rating) urlFilters.rating = parseInt(rating)
    
    const inStock = searchParams.get('inStock')
    if (inStock) urlFilters.inStock = inStock === 'true'
    
    const onSale = searchParams.get('onSale')
    if (onSale) urlFilters.onSale = onSale === 'true'
    
    setFilters(prev => ({ ...prev, ...urlFilters }))
  }, [searchParams])

  const buildQueryParams = (filters: ProductFilter) => {
    const params = new URLSearchParams()
    
    if (filters.categories.length > 0) {
      params.set('categories', filters.categories.join(','))
    }
    
    if (filters.colors.length > 0) {
      params.set('colors', filters.colors.join(','))
    }
    
    if (filters.sizes.length > 0) {
      params.set('sizes', filters.sizes.join(','))
    }
    
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) {
      params.set('minPrice', filters.priceRange[0].toString())
      params.set('maxPrice', filters.priceRange[1].toString())
    }
    
    if (filters.rating > 0) {
      params.set('rating', filters.rating.toString())
    }
    
    if (filters.inStock) {
      params.set('inStock', 'true')
    }
    
    if (filters.onSale) {
      params.set('onSale', 'true')
    }
    
    return params.toString()
  }

  return {
    filters,
    setFilters,
    buildQueryParams
  }
}
