"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import ProductCard from "./product-card"
import { Button } from "./ui/button"
import { Grid, List } from "lucide-react"

export default function ProductsGrid() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("featured")

  // Mock products data
  const products = [
    {
      id: "1",
      name: "Premium Cotton T-Shirt",
      price: 29.99,
      originalPrice: 39.99,
      image: "/images/hero2.jpg",
      rating: 4.5,
      reviews: 128,
      isNew: true,
      isSale: true,
    },
    {
      id: "2",
      name: "Designer Denim Jacket",
      price: 89.99,
      originalPrice: 120.0,
      image: "/images/hero3.jpg",
      rating: 4.8,
      reviews: 89,
      isNew: false,
      isSale: true,
    },
    {
      id: "3",
      name: "Casual Summer Dress",
      price: 45.99,
      image: "/images/heroImg1.png",
      rating: 4.6,
      reviews: 156,
      isNew: true,
      isSale: false,
    },
    {
      id: "4",
      name: "Classic Leather Boots",
      price: 129.99,
      originalPrice: 159.99,
      image: "/images/hero2.jpg",
      rating: 4.7,
      reviews: 203,
      isNew: false,
      isSale: true,
    },
    {
      id: "5",
      name: "Vintage Graphic Hoodie",
      price: 59.99,
      image: "/images/hero3.jpg",
      rating: 4.4,
      reviews: 94,
      isNew: true,
      isSale: false,
    },
    {
      id: "6",
      name: "Elegant Evening Gown",
      price: 199.99,
      originalPrice: 249.99,
      image: "/images/heroImg1.png",
      rating: 4.9,
      reviews: 67,
      isNew: false,
      isSale: true,
    },
  ]

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6 p-4 bg-card rounded-2xl border">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Showing {products.length} products</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="newest">Newest</option>
            <option value="rating">Highest Rated</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-none"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <motion.div
        className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
        layout
      >
        {products.map((product, index) => (
          <ProductCard key={product.id} {...product} index={index} />
        ))}
      </motion.div>

      {/* Load More */}
      <div className="text-center mt-12">
        <Button variant="outline" size="lg" className="px-8 bg-transparent">
          Load More Products
        </Button>
      </div>
    </div>
  )
}
