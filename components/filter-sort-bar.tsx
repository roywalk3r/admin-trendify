"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

// Map display sort labels to API sort param
const SORT_MAP: Record<string, string> = {
  "Newest": "createdAt-desc",
  "Price (Low-High)": "price-asc",
  "Price (High-Low)": "price-desc",
  "Most Popular": "name-desc", // fallback mapping
}

// Optional mapping display category -> slug used by API
const CATEGORY_SLUGS: Record<string, string> = {
  "All Categories": "",
  "Clothing": "clothing",
  "Shoes": "shoes",
  "Accessories": "accessories",
  "Electronics": "electronics",
}

export default function FilterSortBar({ fixedCategory }: { fixedCategory?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [selectedCategory, setSelectedCategory] = useState("Category")
  const [selectedSize, setSelectedSize] = useState("Size")
  const [selectedColor, setSelectedColor] = useState("Color")
  const [selectedSort, setSelectedSort] = useState("Newest")

  const categories = ["All Categories", "Clothing", "Shoes", "Accessories", "Electronics"]
  const sizes = ["All Sizes", "XS", "S", "M", "L", "XL", "XXL"]
  const colors = ["All Colors", "Black", "White", "Red", "Blue", "Green", "Pink"]
  const sortOptions = ["Newest", "Price (Low-High)", "Price (High-Low)", "Most Popular"]

  // Initialize selections from URL on mount and when URL changes (back/forward)
  useEffect(() => {
    const currentSort = searchParams.get("sort") || "createdAt-desc"
    const foundSort = Object.entries(SORT_MAP).find(([, v]) => v === currentSort)?.[0]
    if (foundSort) setSelectedSort(foundSort)

    const cat = searchParams.get("category") || ""
    if (cat) {
      const display = Object.entries(CATEGORY_SLUGS).find(([, slug]) => slug === cat)?.[0]
      if (display) setSelectedCategory(display)
    }

    const sz = searchParams.get("size")
    if (sz) setSelectedSize(sz)
    const col = searchParams.get("color")
    if (col) setSelectedColor(col)
  }, [searchParams])

  function updateParams(next: Record<string, string | null | undefined>) {
    const sp = new URLSearchParams(searchParams.toString())
    Object.entries(next).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") sp.delete(k)
      else sp.set(k, String(v))
    })
    // Lock category for fixed sections (e.g., men/women pages)
    if (fixedCategory) sp.set("category", fixedCategory)
    // Reset pagination on changes
    sp.delete("page")
    router.push(`${pathname}?${sp.toString()}`)
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white border-b">
      {/* Filters Section */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-forground">Filters:</span>

        {/* Category Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" className="justify-between min-w-[120px] bg-transparent" disabled={!!fixedCategory}>
              {fixedCategory ? `Category` : selectedCategory}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {categories.map((category) => (
              <DropdownMenuItem
                key={category}
                onClick={() => {
                  setSelectedCategory(category)
                  const slug = CATEGORY_SLUGS[category] || ""
                  updateParams({ category: slug || null })
                }}
              >
                {category}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Size Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="justify-between min-w-[100px] bg-transparent">
              {selectedSize}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {sizes.map((size) => (
              <DropdownMenuItem key={size} onClick={() => {
                setSelectedSize(size)
                updateParams({ size: size === "All Sizes" ? null : size })
              }}>
                {size}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Color Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="justify-between min-w-[100px] bg-transparent">
              {selectedColor}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {colors.map((color) => (
              <DropdownMenuItem key={color} onClick={() => {
                setSelectedColor(color)
                updateParams({ color: color === "All Colors" ? null : color })
              }}>
                {color}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Sort Section */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-forground">Sort by:</span>
        <div className="flex gap-2">
          {sortOptions.map((option) => (
            <Button
              key={option}
              type="button"
              variant={selectedSort === option ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setSelectedSort(option)
                const mapped = SORT_MAP[option] || "createdAt-desc"
                updateParams({ sort: mapped })
              }}
              className={
                selectedSort === option
                  ? "bg-ascent text-ascent-foreground glass hover:bg-ascent-foreground hover:text-ascent"
                  : "text-gray-600 hover:text-gray-900"
              }
            >
              {option}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
