"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Heart, ShoppingCart, Trash2 } from "lucide-react"
import { Button } from "./ui/button"
import Image from "next/image"

interface WishlistItem {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  inStock: boolean
}

interface WishlistSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function WishlistSidebar({ isOpen, onClose }: WishlistSidebarProps) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([
    {
      id: "1",
      name: "Elegant Summer Dress",
      price: 45.99,
      originalPrice: 65.99,
      image: "/images/product_3.png",
      inStock: true,
    },
    {
      id: "2",
      name: "Classic Leather Boots",
      price: 129.99,
      image: "/images/product_4.png",
      inStock: false,
    },
    {
      id: "3",
      name: "Vintage Graphic Hoodie",
      price: 59.99,
      image: "/images/product_5.png",
      inStock: true,
    },
  ])

  const removeItem = (id: string) => {
    setWishlistItems((items) => items.filter((item) => item.id !== id))
  }

  const moveToCart = (id: string) => {
    // In a real app, this would add to cart and remove from wishlist
    removeItem(id)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
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
              {wishlistItems.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Your wishlist is empty</p>
                  <Button className="mt-4" onClick={onClose}>
                    Continue Shopping
                  </Button>
                </div>
              ) : (
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
                          {item.originalPrice && (
                            <span className="text-sm text-muted-foreground line-through">${item.originalPrice}</span>
                          )}
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            onClick={() => moveToCart(item.id)}
                            disabled={!item.inStock}
                            className="flex-1 text-xs"
                          >
                            <ShoppingCart className="w-3 h-3 mr-1" />
                            {item.inStock ? "Add to Cart" : "Notify Me"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeItem(item.id)}
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
                    wishlistItems.filter((item) => item.inStock).forEach((item) => moveToCart(item.id))
                  }}
                >
                  Add All to Cart
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
