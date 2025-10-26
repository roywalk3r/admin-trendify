"use client"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "./ui/button"
import { Slider } from "./ui/slider"
import { Checkbox } from "./ui/checkbox"
import { X } from "lucide-react"

interface Category {
  id: string
  name: string
  slug: string
  _count?: { products: number }
}

export default function ProductFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [priceRange, setPriceRange] = useState([0, 500])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"]
  const colors = [
    { name: "Black", value: "#000000" },
    { name: "White", value: "#FFFFFF" },
    { name: "Gray", value: "#6B7280" },
    { name: "Navy", value: "#1E3A8A" },
    { name: "Red", value: "#DC2626" },
    { name: "Green", value: "#059669" },
  ]

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        const data = await response.json()
        if (data.data && Array.isArray(data.data)) {
          setCategories(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  // Initialize filters from URL params
  useEffect(() => {
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const categories = searchParams.get('categories')
    const sizes = searchParams.get('sizes')
    const colors = searchParams.get('colors')

    if (minPrice && maxPrice) {
      setPriceRange([parseInt(minPrice), parseInt(maxPrice)])
    }
    if (categories) {
      setSelectedCategories(categories.split(','))
    }
    if (sizes) {
      setSelectedSizes(sizes.split(','))
    }
    if (colors) {
      setSelectedColors(colors.split(','))
    }
  }, [])

  const handleCategoryChange = (categorySlug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categorySlug) ? prev.filter((c) => c !== categorySlug) : [...prev, categorySlug],
    )
  }

  const applyFilters = () => {
    const params = new URLSearchParams()
    
    // Price range
    if (priceRange[0] > 0 || priceRange[1] < 500) {
      params.set('minPrice', priceRange[0].toString())
      params.set('maxPrice', priceRange[1].toString())
    }
    
    // Categories
    if (selectedCategories.length > 0) {
      params.set('categories', selectedCategories.join(','))
    }
    
    // Sizes
    if (selectedSizes.length > 0) {
      params.set('sizes', selectedSizes.join(','))
    }
    
    // Colors
    if (selectedColors.length > 0) {
      params.set('colors', selectedColors.join(','))
    }
    
    // Update URL with new params
    router.push(`/products?${params.toString()}`)
  }

  const clearAllFilters = () => {
    setPriceRange([0, 500])
    setSelectedCategories([])
    setSelectedSizes([])
    setSelectedColors([])
    router.push('/products')
  }

  return (
    <motion.div
      className="bg-card rounded-2xl p-6 border sticky top-24"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="typography text-lg">Filters</h3>
        <Button variant="ghost" size="sm" onClick={clearAllFilters}>
          <X className="w-4 h-4 mr-1" />
          Clear All
        </Button>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Price Range</h4>
        <Slider value={priceRange} onValueChange={setPriceRange} max={500} step={10} className="mb-2" />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Categories</h4>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={category.slug}
                  checked={selectedCategories.includes(category.slug)}
                  onCheckedChange={() => handleCategoryChange(category.slug)}
                />
                <label
                  htmlFor={category.slug}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {category.name}
                  {category._count?.products !== undefined && (
                    <span className="text-muted-foreground ml-1">({category._count.products})</span>
                  )}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sizes */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Sizes</h4>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <Button
              key={size}
              variant={selectedSizes.includes(size) ? "default" : "outline"}
              size="sm"
              onClick={() =>
                setSelectedSizes((prev) => (prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]))
              }
            >
              {size}
            </Button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Colors</h4>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color.name}
              className={`w-8 h-8 rounded-full border-2 ${
                selectedColors.includes(color.name) ? "border-primary" : "border-gray-300"
              }`}
              style={{ backgroundColor: color.value }}
              onClick={() =>
                setSelectedColors((prev) =>
                  prev.includes(color.name) ? prev.filter((c) => c !== color.name) : [...prev, color.name],
                )
              }
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Apply Filters Button */}
      <Button className="w-full" onClick={applyFilters}>Apply Filters</Button>
    </motion.div>
  )
}
