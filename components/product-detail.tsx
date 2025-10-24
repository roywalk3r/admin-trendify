"use client"

import { useEffect, useState } from "react"
import { ShoppingCart, Heart, Star, Share2, Truck, Shield, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AppwriteGallery } from "@/components/appwrite/appwrite-gallery"
import { useProductView } from "@/hooks/use-product-view"
import { useCartStore } from "@/lib/store/cart-store"
import { useSettings } from "@/lib/contexts/settings-context"
import { toast } from "sonner"
import type { Product } from "@/types/product"
import { useUser } from "@clerk/nextjs"
import { useI18n } from "@/lib/i18n/I18nProvider"

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
  const { t } = useI18n()
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCartStore()
  const settings = useSettings()
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const [inWishlist, setInWishlist] = useState<boolean | null>(null)
  const { isSignedIn } = useUser()

  // Track product view
  useProductView(product.id)

  // On mount, check if this product is in wishlist (if user is signed in)
  // Non-blocking: ignore errors/401
  useEffect(() => {
    let mounted = true
    const check = async () => {
      try {
        const res = await fetch(`/api/wishlist?productId=${encodeURIComponent(product.id)}`, { cache: "no-store" })
        if (!res.ok) return
        const json = await res.json()
        if (mounted) setInWishlist(Boolean(json?.data?.inWishlist))
      } catch {}
    }
    void check()
    return () => {
      mounted = false
    }
  }, [product.id])

  // Toggle wishlist (optimistic). Mirrors ProductCard behavior
  const toggleWishlist = async () => {
    if (wishlistLoading) return
    const current = Boolean(inWishlist)
    const next = !current
    setInWishlist(next)
    setWishlistLoading(true)
    try {
      if (next) {
        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id }),
        })
        if (!res.ok) throw new Error(await res.text())
        toast.success(t("product.wishlistAdded"), { description: product.name })
        window.dispatchEvent(new Event("wishlist:updated"))
      } else {
        const res = await fetch(`/api/wishlist?productId=${encodeURIComponent(product.id)}`, { method: "DELETE" })
        if (!res.ok) throw new Error(await res.text())
        toast.success(t("product.wishlistRemoved"), { description: product.name })
        window.dispatchEvent(new Event("wishlist:updated"))
      }
    } catch (e: any) {
      setInWishlist(current)
      toast.error(t("product.wishlistActionFailed"), { description: String(e?.message || "") })
    } finally {
      setWishlistLoading(false)
    }
  }

  const handleAddToCart = async () => {
    // Optimistic local add
    addItem({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      quantity,
      image: product.images[0] || "/placeholder.svg",
    })

    try {
      if (isSignedIn) {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: product.id,
            name: product.name,
            price: Number(product.price),
            quantity,
            image: product.images[0] || "/placeholder.svg",
          }),
        })
        if (!res.ok) throw new Error(`${res.status}`)
      }
      toast.success(t("product.addedToCart"), {
        description: `${product.name}`,
      })
    } catch (e: any) {
      const msg = String(e?.message || "")
      if (!isSignedIn || msg === "401") {
        toast.error(t("product.signInToSyncCart"), { description: t("product.itemKeptLocally") })
      } else {
        toast.error(t("product.failedToSyncCart"), { description: `Error ${msg}` })
      }
    }
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
        toast.success(t("product.copiedLink"))
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success(t("product.copiedLink"))
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
              {product.averageRating ? product.averageRating.toFixed(1) : t("product.noRating")} ({product.reviewCount || 0} {t("product.reviews")})
            </span>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
            <span className="text-3xl font-bold">
              {settings?.currencySymbol || "$"}
              {Number(product.price).toFixed(2)}
            </span>
              {hasDiscount && (
                  <>
                <span className="text-lg text-muted-foreground line-through">
                  {settings?.currencySymbol || "$"}
                  {Number(product.comparePrice).toFixed(2)}
                </span>
                    <Badge variant="destructive" className="text-xs">
                      {discountPercentage}% OFF
                    </Badge>
                  </>
              )}
            </div>
            {settings?.taxRate && (
                <p className="text-sm text-muted-foreground">{t("product.taxIncluded")}</p>
            )}
          </div>

          {/* Stock Status */}
          <div className="space-y-2">
            {isOutOfStock ? (
                <Badge variant="destructive">{t("product.outOfStock")}</Badge>
            ) : isLowStock ? (
                <Badge variant="secondary">{t("product.inStock")} ({product.stock} {t("product.available")})</Badge>
            ) : (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {t("product.inStock")} ({product.stock} {t("product.available")})
                </Badge>
            )}
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">{t("product.description")}</h3>
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          </div>

          <Separator />

          {/* Quantity Selection */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="font-medium">{t("product.quantity")}</label>
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
                <span className="text-sm text-muted-foreground">{product.stock} {t("product.available")}</span>
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
                {isOutOfStock ? t("product.outOfStock") : t("product.addToCart")}
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="h-12 bg-transparent"
                onClick={toggleWishlist}
                disabled={wishlistLoading}
                aria-pressed={inWishlist === true}
                title={inWishlist ? t("product.inWishlist") : t("product.addToWishlist")}
              >
                <Heart className={`mr-2 h-4 w-4 ${inWishlist ? "fill-current" : ""}`} />
                {inWishlist ? t("product.inWishlist") : wishlistLoading ? t("product.adding") : t("product.wishlist")}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Features */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t("product.whyChoose")}</h3>
            <div className="grid gap-3">
              <div className="flex items-center gap-3 text-sm">
                <Truck className="h-4 w-4 text-blue-600" />
                <span>{t("product.freeShippingOverPrefix")} {settings?.currencySymbol || "$"}{settings?.freeShippingThreshold || 50}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="h-4 w-4 text-green-600" />
                <span>{t("product.yearWarranty")}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <RotateCcw className="h-4 w-4 text-orange-600" />
                <span>{t("product.returnPolicy30d")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}
