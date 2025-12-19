"use client"

import { useEffect, useState } from "react"
import { ShoppingCart, Heart, Star, Share2, Truck, Shield, RotateCcw, CheckCircle, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AppwriteGallery } from "@/components/appwrite/appwrite-gallery"
import { MobileProductGallery } from "@/components/mobile/mobile-product-gallery"
import { MobileAccordion, MobileAccordionItem } from "@/components/mobile/mobile-accordion"
import { StickyActionBar } from "@/components/mobile/sticky-action-bar"
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
import { cn } from "@/lib/utils"

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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 min-w-0 max-w-full overflow-hidden">
        {/* Product Images */}
        <div className="space-y-6 min-w-0 flex-1">
          {/* Desktop: Original Gallery */}
          <div className="hidden lg:block rounded-2xl overflow-hidden border border-border/50 shadow-lg">
            <AppwriteGallery images={product.images} productName={product.name} />
          </div>
          
          {/* Mobile: New Gallery */}
          <div className="lg:hidden">
            <MobileProductGallery images={product.images} productName={product.name} />
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
        <div className="space-y-6 min-w-0 flex-1 overflow-x-hidden">
          {/* Mobile Trust Badges */}
          <div className="lg:hidden grid grid-cols-3 gap-2 text-center">
            <div className="flex flex-col items-center gap-1 p-2">
              <Truck className="h-5 w-5 text-primary" />
              <span className="text-xs text-muted-foreground">Free Shipping</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-xs text-muted-foreground">Secure Payment</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2">
              <RotateCcw className="h-5 w-5 text-primary" />
              <span className="text-xs text-muted-foreground">Easy Returns</span>
            </div>
          </div>
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

          {/* Mobile Add to Cart Section (shown above accordions) */}
          <div className="lg:hidden">
            {/* Pricing */}
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-4 border border-primary/20">
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-primary">
                    {settings?.currencySymbol || "$"}
                    {activePrice.toFixed(2)}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm text-muted-foreground line-through">
                      {settings?.currencySymbol || "$"}
                      {Number(product.comparePrice).toFixed(2)}
                    </span>
                  )}
                </div>
                {hasDiscount && (
                  <Badge variant="destructive" className="text-xs">
                    {discountPercentage}% OFF
                  </Badge>
                )}
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center justify-between">
              <StockBadge
                stock={activeStock}
                lowStockThreshold={product.lowStockThreshold ?? undefined}
                productId={product.id}
                productName={variantDisplayName}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="text-muted-foreground"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Variant Selection */}
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
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="flex items-center gap-3">
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  className="h-10 w-10 rounded-none"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={increaseQuantity}
                  disabled={activeStock <= quantity}
                  className="h-10 w-10 rounded-none"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 h-[var(--mobile-touch-target)]"
                size="lg"
              >
                {isOutOfStock ? "Out of Stock" : "Add to Cart"}
              </Button>
            </div>

            {/* Wishlist */}
            <Button
              variant="outline"
              onClick={toggleWishlist}
              disabled={wishlistLoading}
              className="w-full h-[var(--mobile-touch-target)]"
            >
              <Heart className={cn("h-4 w-4 mr-2", inWishlist && "fill-red-500 text-red-500")} />
              {inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
            </Button>
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

          {/* Mobile Accordions */}
          <div className="lg:hidden">
            <MobileAccordion>
              {/* Description Accordion */}
              <MobileAccordionItem title="Description" defaultOpen>
                <div className="space-y-3">
                  <SafeHtml html={product.description} className="prose prose-sm max-w-none text-muted-foreground" />
                </div>
              </MobileAccordionItem>

              {/* Shipping & Returns Accordion */}
              <MobileAccordionItem title="Shipping & Returns">
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Truck className="h-4 w-4 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Free Shipping</p>
                      <p className="text-muted-foreground">On orders over $50</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <RotateCcw className="h-4 w-4 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">30-Day Returns</p>
                      <p className="text-muted-foreground">Easy returns, no questions asked</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Secure Payment</p>
                      <p className="text-muted-foreground">SSL encrypted transactions</p>
                    </div>
                  </div>
                </div>
              </MobileAccordionItem>

              {/* Reviews Accordion */}
              <MobileAccordionItem title={`Reviews (${product.reviewCount || 0})`}>
                <div className="space-y-4">
                  {/* Rating Summary */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="h-5 w-5"
                          fill={star <= Math.round(product.averageRating || 0) ? "#facc15" : "none"}
                          stroke={star <= Math.round(product.averageRating || 0) ? "#facc15" : "currentColor"}
                        />
                      ))}
                    </div>
                    <div>
                      <span className="font-semibold">
                        {product.averageRating ? product.averageRating.toFixed(1) : "0.0"}
                      </span>
                      <span className="text-sm text-muted-foreground ml-1">
                        ({product.reviewCount || 0} reviews)
                      </span>
                    </div>
                  </div>
                  
                  {/* Reviews List - Placeholder */}
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Reviews will be loaded here</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      View All Reviews
                    </Button>
                  </div>
                </div>
              </MobileAccordionItem>
            </MobileAccordion>
          </div>

          {/* Desktop Quantity Selection & Actions */}
          <div className="hidden lg:block space-y-4">
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

          {/* Desktop Features */}
          <div className="hidden lg:block space-y-4">
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
      {/* Mobile Sticky Add to Cart Bar */}
      <div className="lg:hidden">
        <StickyActionBar position="bottom">
          <div className="flex items-center gap-2 flex-1">
            <div className="flex items-center border rounded-lg">
              <Button
                variant="ghost"
                size="icon"
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
                className="h-8 w-8 rounded-none"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={increaseQuantity}
                disabled={activeStock <= quantity}
                className="h-8 w-8 rounded-none"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <Button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="flex-1 h-10 text-sm font-semibold"
            >
              {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleWishlist}
            disabled={wishlistLoading}
            className="h-10 w-10"
          >
            <Heart className={cn("h-4 w-4", inWishlist && "fill-red-500 text-red-500")} />
          </Button>
        </StickyActionBar>
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
