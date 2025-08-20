"use client"
import { useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Heart, ShoppingCart, Trash2 } from "lucide-react"
import { Button } from "./ui/button"
import Image from "next/image"
import { useApi } from "@/lib/hooks/use-api"
import { useCartStore } from "@/lib/store/cart-store"
import { useToast } from "@/hooks/use-toast"

interface WishlistSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function WishlistSidebar({ isOpen, onClose }: WishlistSidebarProps) {
  const { toast } = useToast()
  const addToCart = useCartStore((s) => s.addItem)

  // Fetch wishlist only when sidebar is open
  const { data, error, isLoading, refetch } = useApi<any>("/api/wishlist", { enabled: isOpen });

  // Fetching is controlled by useApi via the `enabled` option; no extra effect needed

  const wishlistItems = useMemo(() => {
    // useApi unwraps the top-level { data: ... } so `data` is the wishlist object
    const items = data?.items || []
    // Map API items (each has .product) to UI shape
    return items.map((item: any) => {
      const p = item.product || item
      return {
        id: p.id as string,
        name: p.name as string,
        // API returns Decimal/number as string -> coerce
        price: typeof p.price === "string" ? Number(p.price) : (p.price as number),
        image: (p.images && p.images[0]) || "/placeholder.svg",
        inStock: (p.stock ?? 0) > 0,
      }
    }) as Array<{
      id: string
      name: string
      price: number
      image: string
      inStock: boolean
    }>
  }, [data]);

  // (Mutations for wishlist add/remove are done via fetch; hooks optional here)
   const handleRemove = async (productId: string) => {
    try {
      await fetch(`/api/wishlist?productId=${encodeURIComponent(productId)}`, { method: "DELETE" })
      refetch()
      // notify header to refresh count
      window.dispatchEvent(new Event("wishlist:updated"))
      toast({ title: "Removed from wishlist" })
    } catch (e: any) {
      toast({ title: "Failed to remove", description: e?.message || "", variant: "destructive" })
    }
  }

  const moveToCart = async (item: { id: string; name: string; price: number; image: string }) => {
    // Optimistic local add
    addToCart({ id: item.id, name: item.name, price: item.price, quantity: 1, image: item.image })
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, name: item.name, price: item.price, quantity: 1, image: item.image }),
      })
      if (!res.ok) throw new Error(`${res.status}`)
    } catch (e: any) {
      // keep local cart but inform if not synced
      const msg = String(e?.message || "")
      if (msg === "401") {
        toast({ title: "Sign in to sync your cart", description: "Item added locally.", variant: "destructive" })
      } else {
        toast({ title: "Failed to sync cart", description: msg, variant: "destructive" })
      }
    }
    // Remove from wishlist and notify
    await handleRemove(item.id)
    window.dispatchEvent(new Event("wishlist:updated"))
    toast({ title: "Added to cart", description: item.name })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            className="fixed right-0 top-0 h-full w-full max-w-md bg-background shadow-2xl z-50 flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                <h2 className="typography text-lg">Wishlist</h2>
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{wishlistItems.length}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Wishlist Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Error state */}
              {error && error !== "Unauthorized" && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">{String(error)}</p>
                </div>
              )}

              {/* Loading state */}
              {!error && isLoading && (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-4 p-4 border rounded-lg animate-pulse">
                      <div className="w-20 h-20 bg-muted rounded" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-2/3 bg-muted rounded" />
                        <div className="h-4 w-1/3 bg-muted rounded" />
                        <div className="h-8 w-1/2 bg-muted rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state */}
              {(!error || error === "Unauthorized") && !isLoading && wishlistItems.length === 0 && (
                <div className="text-center py-12">
                  <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Your wishlist is empty</p>
                  <Button className="mt-4" onClick={onClose}>
                    Continue Shopping
                  </Button>
                </div>
              )}

              {/* List */}
              {(!error || error === "Unauthorized") && !isLoading && wishlistItems.length > 0 && (
                <div className="space-y-4">
                  {wishlistItems.map((item) => (
                    <motion.div
                      key={item.id}
                      className="flex gap-4 p-4 border rounded-lg"
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <div className="relative">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="rounded-lg object-cover"
                        />
                        {!item.inStock && (
                          <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs font-semibold">Out of Stock</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-sm line-clamp-2">{item.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-semibold">${item.price}</span>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            onClick={() => moveToCart(item)}
                            disabled={!item.inStock}
                            className="flex-1 text-xs"
                          >
                            <ShoppingCart className="w-3 h-3 mr-1" />
                            {item.inStock ? "Add to Cart" : "Notify Me"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemove(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {wishlistItems.length > 0 && (
              <div className="border-t p-6">
                <Button
                  className="w-full bg-ascent hover:bg-ascent/90"
                  onClick={() => {
                    // Move all in-stock items to cart
                    wishlistItems
                      .filter((item) => item.inStock)
                      .forEach((item) => void moveToCart(item))
                  }}
                >
                  Add All to Cart
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
