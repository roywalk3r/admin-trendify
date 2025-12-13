"use client"

import { useEffect, useState } from "react"
import { ShoppingCart, Heart, Star, Share2, Truck, Shield, RotateCcw, CheckCircle } from "lucide-react"
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
import SafeHtml from "@/components/safe-html"
import StockBadge from "@/components/product/stock-badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

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
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false)
  const variants = Array.isArray((product as any).variants) ? (product as any).variants : []
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    variants[0]?.id ?? null
  )
  const { isSignedIn } = useUser()
  const descriptionTextLength = (product.description || "").replace(/<[^>]*>/g, "").trim().length
  const hasLongDescription = descriptionTextLength > 260 || (product.description || "").length > 600
  const selectedVariant = variants.find((v: any) => v.id === selectedVariantId) || null
  const activePrice = selectedVariant ? Number(selectedVariant.price) : Number(product.price)
  const activeStock = selectedVariant ? selectedVariant.stock : product.stock
  const variantAttributes = (selectedVariant?.attributes || {}) as Record<string, string>
  const variantColor = typeof variantAttributes.color === "string" ? variantAttributes.color : undefined
  const variantSize = typeof variantAttributes.size === "string" ? variantAttributes.size : undefined
  const variantDisplayName = selectedVariant?.name ? `${product.name} (${selectedVariant.name})` : product.name

  useEffect(() => {
    if (variants.length === 0) {
      setSelectedVariantId(null)
      return
    }
    const exists = variants.some((v: any) => v.id === selectedVariantId)
    if (!exists) {
      setSelectedVariantId(variants[0].id)
    }
  }, [variants, selectedVariantId])

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
      name: variantDisplayName,
      price: activePrice,
      quantity,
      image: product.images[0] || "/placeholder.svg",
      color: variantColor,
      size: variantSize,
      variantId: selectedVariant?.id,
    })

    try {
      if (isSignedIn) {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: product.id,
            name: variantDisplayName,
            price: activePrice,
            quantity,
            image: product.images[0] || "/placeholder.svg",
            color: variantColor,
            size: variantSize,
          }),
        })
        if (!res.ok) throw new Error(`${res.status}`)
      }
      toast.success(t("product.addedToCart"), {
        description: `${variantDisplayName}`,
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
    if (quantity < activeStock) {
      setQuantity((prev) => prev + 1)
    }
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1)
    }
  }

  const isOutOfStock = activeStock <= 0
  const hasDiscount = product.comparePrice && Number(product.comparePrice) > activePrice
  const discountPercentage = hasDiscount
      ? Math.round(((Number(product.comparePrice) - activePrice) / Number(product.comparePrice)) * 100)
      : 0

  return (
    <>
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Images */}
        <div className="space-y-6">
          <div className="rounded-2xl overflow-hidden border border-border/50 shadow-lg">
            <AppwriteGallery images={product.images} productName={product.name} />
          </div>

          {/* Product Tags */}
          {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs px-3 py-1 rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
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
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3 flex-1">
                <h1 className="text-3xl lg:text-4xl font-black leading-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
                  {product.name}
                </h1>
                {product.category && (
                    <Badge variant="outline" className="w-fit text-xs px-3 py-1 rounded-full border-primary/30 text-primary font-semibold">
                      {product.category.name}
                    </Badge>
                )}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleShare}
                className="shrink-0 rounded-full hover:bg-primary/10 hover:border-primary transition-all"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Rating */}
            <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                          key={star}
                          className="h-5 w-5 transition-transform hover:scale-110"
                          fill={star <= Math.round(product.averageRating || 0) ? "#facc15" : "none"}
                          stroke={star <= Math.round(product.averageRating || 0) ? "#facc15" : "currentColor"}
                      />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">
                    {product.averageRating ? product.averageRating.toFixed(1) : "0.0"}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({product.reviewCount || 0} {t("product.reviews")})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/20">
            <div className="space-y-3">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {settings?.currencySymbol || "$"}
                  {activePrice.toFixed(2)}
                </span>
                {hasDiscount && (
                    <>
                      <span className="text-xl text-muted-foreground line-through font-medium">
                        {settings?.currencySymbol || "$"}
                        {Number(product.comparePrice).toFixed(2)}
                      </span>
                      <Badge variant="destructive" className="text-sm px-3 py-1 rounded-full animate-pulse">
                        {discountPercentage}% OFF
                      </Badge>
                    </>
                )}
              </div>
              {settings?.taxRate && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    {t("product.taxIncluded")}
                  </p>
              )}
            </div>
          </div>

          {/* Variant selection */}
          {variants.length > 0 && (
            <div className="space-y-2">
              <Label className="font-semibold">Choose a variant</Label>
              <Select
                value={selectedVariant?.id ?? ""}
                onValueChange={(val) => {
                  setSelectedVariantId(val)
                  setQuantity(1)
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select variant" />
                </SelectTrigger>
                <SelectContent>
                  {variants.map((variant: any) => {
                    const attrs = variant.attributes || {}
                    const attrLabel = Object.keys(attrs)
                      .map((key) => `${key}: ${attrs[key]}`)
                      .join(" • ")
                    return (
                      <SelectItem key={variant.id} value={variant.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{variant.name || "Variant"}</span>
                          <span className="text-xs text-muted-foreground">
                            {attrLabel || "Attributes"}
                          </span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-2">
                {variantColor && <Badge variant="outline">Color: {variantColor}</Badge>}
                {variantSize && <Badge variant="outline">Size: {variantSize}</Badge>}
              </div>
            </div>
          )}

          {/* Stock Status */}
          <div className="space-y-2">
            <StockBadge
              stock={activeStock}
              lowStockThreshold={product.lowStockThreshold ?? undefined}
              productId={product.id}
              productName={variantDisplayName}
            />
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h3 className="font-bold text-xl flex items-center gap-2">
              <span className="w-1 h-6 bg-primary rounded-full"></span>
              {t("product.description")}
            </h3>
            <div className="relative rounded-xl border border-border/50 bg-background/70 p-4">
              <div className={hasLongDescription ? "max-h-40 overflow-hidden" : ""}>
                <SafeHtml html={product.description} className="prose prose-sm max-w-none text-muted-foreground" />
              </div>
              {hasLongDescription && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent" />
              )}
            </div>
            {hasLongDescription && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsDescriptionOpen(true)}>
                  Show full description
                </Button>
              </div>
            )}
          </div>

          <Separator className="my-6" />

          {/* Quantity Selection */}
          <div className="space-y-4">
            <div className="space-y-3">
              <label className="font-semibold text-base flex items-center gap-2">
                <span className="w-1 h-5 bg-primary rounded-full"></span>
                {t("product.quantity")}
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-border rounded-xl overflow-hidden shadow-sm">
                  <Button
                      variant="ghost"
                      size="icon"
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                      className="h-12 w-12 hover:bg-primary/10 hover:text-primary transition-all rounded-none"
                  >
                    <span className="text-xl font-bold">−</span>
                  </Button>
                  <span className="w-16 text-center font-bold text-lg">{quantity}</span>
                  <Button
                      variant="ghost"
                      size="icon"
                      onClick={increaseQuantity}
                      disabled={activeStock <= quantity}
                      className="h-12 w-12 hover:bg-primary/10 hover:text-primary transition-all rounded-none"
                  >
                    <span className="text-xl font-bold">+</span>
                  </Button>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{activeStock} {t("product.available")}</span>
                  {activeStock <= quantity && activeStock > 0 && (
                    <span className="text-xs text-amber-600">Maximum reached</span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="flex-1 h-14 text-base font-bold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
                  size="lg"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {isOutOfStock ? t("product.outOfStock") : t("product.addToCart")}
              </Button>

              <Button
                variant="outline"
                size="lg"
                className={`h-14 border-2 transition-all hover:scale-[1.02] ${
                  inWishlist ? "bg-red-50 dark:bg-red-950/20 border-red-500 text-red-600" : "hover:bg-primary/5 hover:border-primary"
                }`}
                onClick={toggleWishlist}
                disabled={wishlistLoading}
                aria-pressed={inWishlist === true}
                title={inWishlist ? t("product.inWishlist") : t("product.addToWishlist")}
              >
                <Heart className={`mr-2 h-5 w-5 transition-all ${inWishlist ? "fill-current scale-110" : ""}`} />
                <span className="font-bold">
                  {inWishlist ? t("product.inWishlist") : wishlistLoading ? t("product.adding") : t("product.wishlist")}
                </span>
              </Button>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Features */}
          <div className="space-y-4">
            <h3 className="font-bold text-xl flex items-center gap-2">
              <span className="w-1 h-6 bg-primary rounded-full"></span>
              {t("product.whyChoose")}
            </h3>
            <div className="grid gap-3">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 group hover:shadow-md transition-all">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 group-hover:scale-110 transition-transform">
                  <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="font-medium">{t("product.freeShippingOverPrefix")} {settings?.currencySymbol || "$"}{settings?.freeShippingThreshold || 50}</span>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 group hover:shadow-md transition-all">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 group-hover:scale-110 transition-transform">
                  <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <span className="font-medium">{t("product.yearWarranty")}</span>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 group hover:shadow-md transition-all">
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 group-hover:scale-110 transition-transform">
                  <RotateCcw className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <span className="font-medium">{t("product.returnPolicy30d")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Dialog open={isDescriptionOpen} onOpenChange={setIsDescriptionOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{product.name}</DialogTitle>
            <DialogDescription>Full product description</DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            <SafeHtml html={product.description} className="prose prose-sm max-w-none text-muted-foreground" />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
