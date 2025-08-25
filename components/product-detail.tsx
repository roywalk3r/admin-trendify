"use client"

import { useState } from "react"
import { ShoppingCart, Heart, Star, Share2, Truck, Shield, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AppwriteGallery } from "@/components/appwrite/appwrite-gallery"
import { useProductView } from "@/hooks/use-product-view"
import { useCartStore } from "@/lib/store/cart-store"
import { useSettings } from "@/contexts/settings-context"
import { toast } from "sonner"
import type { Product } from "@/types/product"

interface ProductDetailProps {
  product: Product & {
    category?: {
      id: string
      name: string
      slug: string
    }
    averageRating?: number
    reviewCount?: number
  }
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCartStore()
  const { settings } = useSettings()

  // Track product view
  useProductView(product.id)

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      quantity,
      image: product.images[0] || "/placeholder.svg",
    })

    toast.success(`${product.name} added to cart`, {
      description: `${quantity} item${quantity > 1 ? "s" : ""} added to your cart`,
    })
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        })
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href)
        toast.success("Product link copied to clipboard")
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success("Product link copied to clipboard")
    }
  }

  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity((prev) => prev + 1)
    }
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1)
    }
  }

  const isOutOfStock = product.stock <= 0
  const isLowStock = product.stock <= (product.lowStockThreshold || 5)
  const hasDiscount = product.comparePrice && Number(product.comparePrice) > Number(product.price)
  const discountPercentage = hasDiscount
      ? Math.round(((Number(product.comparePrice) - Number(product.price)) / Number(product.comparePrice)) * 100)
      : 0

  return (
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <AppwriteGallery images={product.images} productName={product.name} />

          {/* Product Tags */}
          {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                ))}
              </div>
          )}
        </div>

        {/* Product Information */}
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold leading-tight">{product.name}</h1>
                {product.category && (
                    <Badge variant="outline" className="w-fit">
                      {product.category.name}
                    </Badge>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className="h-4 w-4"
                        fill={star <= Math.round(product.averageRating || 0) ? "currentColor" : "none"}
                    />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
              {product.averageRating ? product.averageRating.toFixed(1) : "No rating"}({product.reviewCount || 0}{" "}
                reviews)
            </span>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
            <span className="text-3xl font-bold">
              {settings?.currency || "$"}
              {Number(product.price).toFixed(2)}
            </span>
              {hasDiscount && (
                  <>
                <span className="text-lg text-muted-foreground line-through">
                  {settings?.currency || "$"}
                  {Number(product.comparePrice).toFixed(2)}
                </span>
                    <Badge variant="destructive" className="text-xs">
                      {discountPercentage}% OFF
                    </Badge>
                  </>
              )}
            </div>
            {settings?.taxRate && (
                <p className="text-sm text-muted-foreground">Tax included. Shipping calculated at checkout.</p>
            )}
          </div>

          {/* Stock Status */}
          <div className="space-y-2">
            {isOutOfStock ? (
                <Badge variant="destructive">Out of Stock</Badge>
            ) : isLowStock ? (
                <Badge variant="secondary">Only {product.stock} left in stock</Badge>
            ) : (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  In Stock ({product.stock} available)
                </Badge>
            )}
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Description</h3>
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          </div>

          <Separator />

          {/* Quantity Selection */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="font-medium">Quantity</label>
              <div className="flex items-center gap-3">
                <div className="flex items-center border rounded-lg">
                  <Button
                      variant="ghost"
                      size="icon"
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                      className="h-10 w-10"
                  >
                    -
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                      variant="ghost"
                      size="icon"
                      onClick={increaseQuantity}
                      disabled={product.stock <= quantity}
                      className="h-10 w-10"
                  >
                    +
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">{product.stock} available</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="flex-1 h-12 text-base font-medium"
                  size="lg"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {isOutOfStock ? "Out of Stock" : "Add to Cart"}
              </Button>

              <Button variant="outline" size="lg" className="h-12 bg-transparent">
                <Heart className="mr-2 h-4 w-4" />
                Wishlist
              </Button>
            </div>
          </div>

          <Separator />

          {/* Features */}
          <div className="space-y-4">
            <h3 className="font-semibold">Why Choose This Product</h3>
            <div className="grid gap-3">
              <div className="flex items-center gap-3 text-sm">
                <Truck className="h-4 w-4 text-blue-600" />
                <span>Free shipping on orders over {settings?.currency || "$"}50</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="h-4 w-4 text-green-600" />
                <span>1 year warranty included</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <RotateCcw className="h-4 w-4 text-orange-600" />
                <span>30-day return policy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}
