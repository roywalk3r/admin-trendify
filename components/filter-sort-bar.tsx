"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

export default function FilterSortBar() {
  const [selectedCategory, setSelectedCategory] = useState("Category")
  const [selectedSize, setSelectedSize] = useState("Size")
  const [selectedColor, setSelectedColor] = useState("Color")
  const [selectedSort, setSelectedSort] = useState("Newest")

  const categories = ["All Categories", "Clothing", "Shoes", "Accessories", "Electronics"]
  const sizes = ["All Sizes", "XS", "S", "M", "L", "XL", "XXL"]
  const colors = ["All Colors", "Black", "White", "Red", "Blue", "Green", "Pink"]
  const sortOptions = ["Newest", "Price (Low-High)", "Price (High-Low)", "Most Popular"]

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white border-b">
      {/* Filters Section */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-forground">Filters:</span>

        {/* Category Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="justify-between min-w-[120px] bg-transparent">
              {selectedCategory}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {categories.map((category) => (
              <DropdownMenuItem key={category} onClick={() => setSelectedCategory(category)}>
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
              <DropdownMenuItem key={size} onClick={() => setSelectedSize(size)}>
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
              <DropdownMenuItem key={color} onClick={() => setSelectedColor(color)}>
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
              variant={selectedSort === option ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedSort(option)}
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
