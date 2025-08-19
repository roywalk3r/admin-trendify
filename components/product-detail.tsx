"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Star, Heart, Share2, ShoppingCart, Minus, Plus } from "lucide-react"

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  images: string[]
  rating: number
  reviews: number
  description: string
  features: string[]
  sizes: string[]
  colors: string[]
  category: string
  brand: string
  sku: string
  inStock: boolean
  stockCount: number
  isNew?: boolean
  isSale?: boolean
}

interface ProductDetailProps {
  product: Product
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Product Images */}
      <div className="space-y-4">
        {/* Main Image */}
        <motion.div
          className="aspect-square rounded-3xl overflow-hidden bg-gray-100"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Image
            src={product.images[selectedImage] || "/placeholder.svg"}
            alt={product.name}
            width={600}
            height={600}
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Thumbnail Images */}
        <div className="flex gap-4">
          {product.images.map((image, index) => (
            <motion.button
              key={index}
              className={`w-20 h-20 rounded-xl overflow-hidden border-2 ${
                selectedImage === index ? "border-primary" : "border-gray-200"
              }`}
              onClick={() => setSelectedImage(index)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Image
                src={image || "/placeholder.svg"}
                alt={`${product.name} ${index + 1}`}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Product Info */}
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            {product.isNew && <Badge className="bg-green-500">New</Badge>}
            {product.isSale && <Badge className="bg-red-500">Sale</Badge>}
            <span className="text-sm text-muted-foreground">{product.brand}</span>
          </div>
          <h1 className="typography text-3xl md:text-4xl mb-2">{product.name}</h1>
          <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            {product.rating} ({product.reviews} reviews)
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold">${product.price}</span>
          {product.originalPrice && (
            <>
              <span className="text-xl text-muted-foreground line-through">${product.originalPrice}</span>
              <Badge variant="destructive">-{discount}%</Badge>
            </>
          )}
        </div>

        {/* Description */}
        <p className="text-muted-foreground leading-relaxed">{product.description}</p>

        {/* Features */}
        <div>
          <h3 className="font-semibold mb-2">Features</h3>
          <ul className="space-y-1">
            {product.features.map((feature, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-center">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Size Selection */}
        <div>
          <h3 className="font-semibold mb-3">Size</h3>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => (
              <Button
                key={size}
                variant={selectedSize === size ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </Button>
            ))}
          </div>
        </div>

        {/* Color Selection */}
        <div>
          <h3 className="font-semibold mb-3">Color</h3>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((color) => (
              <Button
                key={color}
                variant={selectedColor === color ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedColor(color)}
              >
                {color}
              </Button>
            ))}
          </div>
        </div>

        {/* Quantity */}
        <div>
          <h3 className="font-semibold mb-3">Quantity</h3>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
              <Minus className="w-4 h-4" />
            </Button>
            <span className="w-12 text-center">{quantity}</span>
            <Button variant="outline" size="sm" onClick={() => setQuantity(Math.min(product.stockCount, quantity + 1))}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{product.stockCount} items in stock</p>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button className="flex-1 gap-2" size="lg">
            <ShoppingCart className="w-5 h-5" />
            Add to Cart
          </Button>
          <Button variant="outline" size="lg" onClick={() => setIsWishlisted(!isWishlisted)}>
            <Heart className={`w-5 h-5 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
          <Button variant="outline" size="lg">
            <Share2 className="w-5 h-5" />
          </Button>
        </div>

        {/* Stock Status */}
        <div className="p-4 bg-green-50 rounded-xl border border-green-200">
          <p className="text-green-800 font-medium">✓ In Stock</p>
          <p className="text-green-600 text-sm">Ready to ship in 1-2 business days</p>
        </div>
      </div>
    </div>
  )
}
