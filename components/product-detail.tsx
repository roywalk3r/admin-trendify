"use client"

import { useState } from "react"
import { ShoppingCart, Heart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AppwriteGallery } from "@/components/appwrite/appwrite-gallery"
import { useProductView } from "@/hooks/use-product-view"
import { useCartStore } from "@/lib/store/cart-store"
import { toast } from "sonner"
import type { Product } from "@/types/product"

interface ProductDetailProps {
  product: Product & {
    category?: {
      id: string
      name: string
    }
  }
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCartStore()

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

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <AppwriteGallery images={product.images} productName={product.name} />
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          {product.category && (
            <Badge variant="outline" className="mt-2">
              {product.category.name}
            </Badge>
          )}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-4 w-4" fill={star <= 4 ? "currentColor" : "none"} />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">(24 reviews)</span>
          </div>
        </div>

        <div className="text-3xl font-bold">${Number(product.price).toFixed(2)}</div>

        <div>
          <h3 className="font-medium mb-2">Description</h3>
          <p className="text-muted-foreground">{product.description}</p>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Quantity</h3>
          <div className="flex items-center">
            <Button variant="outline" size="icon" onClick={decreaseQuantity} disabled={quantity <= 1}>
              -
            </Button>
            <span className="w-12 text-center">{quantity}</span>
            <Button variant="outline" size="icon" onClick={increaseQuantity} disabled={product.stock <= quantity}>
              +
            </Button>
            <span className="ml-4 text-sm text-muted-foreground">{product.stock} available</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={handleAddToCart} disabled={product.stock <= 0} className="flex-1" size="lg">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>

          <Button variant="outline" size="lg">
            <Heart className="mr-2 h-4 w-4" />
            Add to Wishlist
          </Button>
        </div>
      </div>
    </div>
  )
}
