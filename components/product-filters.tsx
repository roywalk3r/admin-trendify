"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "./ui/button"
import { Slider } from "./ui/slider"
import { Checkbox } from "./ui/checkbox"
import { X } from "lucide-react"

export default function ProductFilters() {
  const [priceRange, setPriceRange] = useState([0, 500])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])

  const categories = ["T-Shirts", "Dresses", "Jeans", "Jackets", "Shoes", "Accessories", "Bags", "Jewelry"]

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"]
  const colors = [
    { name: "Black", value: "#000000" },
    { name: "White", value: "#FFFFFF" },
    { name: "Gray", value: "#6B7280" },
    { name: "Navy", value: "#1E3A8A" },
    { name: "Red", value: "#DC2626" },
    { name: "Green", value: "#059669" },
  ]

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const clearAllFilters = () => {
    setPriceRange([0, 500])
    setSelectedCategories([])
    setSelectedSizes([])
    setSelectedColors([])
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
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={category}
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => handleCategoryChange(category)}
              />
              <label
                htmlFor={category}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {category}
              </label>
            </div>
          ))}
        </div>
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
      <Button className="w-full">Apply Filters</Button>
    </motion.div>
  )
}
