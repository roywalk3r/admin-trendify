"use client"
import { motion, AnimatePresence, PanInfo } from "framer-motion"
import { X, Plus, Minus, ShoppingBag, Trash2, ChevronRight } from "lucide-react"
import { Button } from "./ui/button"
import Image from "next/image"
import { useCartStore } from "@/lib/store/cart-store"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useCurrency, useShipping } from "@/lib/contexts/settings-context"

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { items: cartItems, removeItem, updateQuantity, subtotal, setItems } = useCartStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const fetchedRef = useRef(false)
  const router = useRouter()
  const { format } = useCurrency()
  const { calculate: calcShipping, freeThreshold, enabled: shippingEnabled } = useShipping()

  const subtotalValue = subtotal()
  const shipping = shippingEnabled ? calcShipping(subtotalValue) : 0
  const total = subtotalValue + shipping
  const freeShippingMessage =
      shippingEnabled && freeThreshold
          ? `Free shipping on orders over ${format(Number(freeThreshold || 0))}`
          : undefined

  // Load cart from backend when sidebar opens (once per open session)
  useEffect(() => {
    const load = async () => {
      if (!isOpen) return
      setLoading(true)
      try {
        const res = await fetch("/api/cart", { cache: "no-store" })
        if (!res.ok) throw new Error(`${res.status}`)
        const json = await res.json()
        const items = json?.data?.items || []
        // Avoid clobbering local cart with empty server response (possible race with sign-in sync)
        if (Array.isArray(items)) {
          if (items.length > 0 || cartItems.length === 0) {
            setItems(items)
          }
        }
      } catch (e: any) {
        // Ignore 401 (unauthenticated) and keep local cart
        if (String(e?.message) !== "401") {
          console.warn("Cart fetch failed", e)
        }
      } finally {
        setLoading(false)
        fetchedRef.current = true
      }
    }
    // Prevent repeated fetches while open toggles
    if (isOpen && !fetchedRef.current) void load()
    if (!isOpen) fetchedRef.current = false
  }, [isOpen, setItems, cartItems.length])

  const serverUpdateQuantity = async (id: string, qty: number, color?: string, size?: string) => {
    const prev = [...cartItems]
    updateQuantity(id, qty, color, size)
    try {
      const res = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, quantity: qty, color, size }),
      })
      if (!res.ok) {
        if (res.status === 401) {
          // Keep local update for guests; inform user it's not synced
          toast({ title: "Quantity updated locally", description: "Sign in to sync your cart across devices." })
          return
        }
        throw new Error(`${res.status}`)
      }
      const json = await res.json()
      const items = json?.data?.items || []
      if (Array.isArray(items)) setItems(items)
    } catch (e: any) {
      // rollback
      setItems(prev)
      toast({ title: "Failed to update quantity", description: String(e?.message || ""), variant: "destructive" })
    }
  }

  const serverRemoveItem = async (id: string, name?: string) => {
    const prev = [...cartItems]
    removeItem(id)
    try {
      const res = await fetch(`/api/cart?id=${encodeURIComponent(id)}`, { method: "DELETE" })
      if (!res.ok) throw new Error(`${res.status}`)
      const json = await res.json()
      const items = json?.data?.items || []
      if (Array.isArray(items)) setItems(items)
      toast({ title: "Item removed", description: name ? `${name} removed from cart.` : undefined })
    } catch (e: any) {
      setItems(prev)
      toast({ title: "Failed to remove item", description: String(e?.message || ""), variant: "destructive" })
    }
  }

  const handleDragEnd = (info: PanInfo, itemId: string) => {
    const { offset, velocity } = info
    const swipeThreshold = 50
    
    if (offset.x < -swipeThreshold || velocity.x < -500) {
      // Swiped left enough, remove item
      const item = cartItems.find(i => i.id === itemId)
      serverRemoveItem(itemId, item?.name)
    }
    setDraggedItem(null)
  }

  const handleDragStart = (itemId: string) => {
    setDraggedItem(itemId)
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
                  className="fixed right-0 top-0 h-full w-full sm:w-full md:max-w-md bg-background shadow-2xl z-[60] flex flex-col"
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" />
                    <h2 className="typography text-lg">Shopping Cart</h2>
                    <span className="bg-ascent text-white text-xs px-2 py-1 rounded-full">
                  {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={onClose} className="h-[var(--mobile-touch-target)] w-[var(--mobile-touch-target)] sm:h-auto sm:w-auto">
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 sm:pb-6">
                  {cartItems.length === 0 ? (
                      <div className="text-center py-12">
                        <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Your cart is empty</p>
                        <Button className="mt-4 h-[var(--mobile-touch-target)]" onClick={onClose}>
                          Continue Shopping
                        </Button>
                      </div>
                  ) : (
                      <div className="space-y-3 sm:space-y-4">
                        {cartItems.map((item) => (
                            <motion.div
                                key={item.id}
                                className="relative flex gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg bg-card"
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={0.2}
                                onDragStart={() => handleDragStart(item.id)}
                                onDragEnd={(_, info) => handleDragEnd(info, item.id)}
                                style={{ x: draggedItem === item.id ? 0 : undefined }}
                            >
                              <Image
                                  src={item.image || "/placeholder.svg"}
                                  alt={item.name}
                                  width={60}
                                  height={60}
                                  className="rounded-lg object-cover flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-sm line-clamp-2">{item.name}</h3>
                                {item.size && <p className="text-xs text-muted-foreground">Size: {item.size}</p>}
                                {item.color && <p className="text-xs text-muted-foreground">Color: {item.color}</p>}
                                <div className="flex items-center justify-between mt-2">
                                  <span className="font-semibold text-sm">{format(Number(item.price))}</span>
                                  <div className="flex items-center gap-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => serverUpdateQuantity(item.id, Math.max(1, item.quantity - 1), item.color, item.size)}
                                        className="w-7 h-7 p-0 sm:w-8 sm:h-8"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </Button>
                                    <span className="w-6 sm:w-8 text-center text-sm font-medium">{item.quantity}</span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => serverUpdateQuantity(item.id, item.quantity + 1, item.color, item.size)}
                                        className="w-7 h-7 p-0 sm:w-8 sm:h-8"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => serverRemoveItem(item.id, item.name)}
                                  className="text-red-500 hover:text-red-700 h-8 w-8 p-0 hidden sm:flex"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </motion.div>
                        ))}
                      </div>
                  )}
                </div>

                {/* Footer - Sticky on Mobile */}
                {cartItems.length > 0 && (
                    <div className="fixed bottom-0 left-0 right-0 sm:relative bg-background border-t p-4 sm:p-6 space-y-3 sm:space-y-4 z-10">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal</span>
                          <span>{format(Number(subtotalValue || 0))}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Shipping</span>
                          <span>{shipping === 0 ? "Free" : format(Number(shipping || 0))}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-lg border-t pt-2">
                          <span>Total</span>
                          <span>{format(Number(total || 0))}</span>
                        </div>
                      </div>
                      <Button
                          className="w-full bg-ascent hover:bg-ascent/90 h-[var(--mobile-touch-target)] sm:h-auto"
                          onClick={() => {
                            onClose()
                            router.push("/checkout")
                          }}
                      >
                        Proceed to Checkout
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                      <p className="text-xs text-center text-muted-foreground">
                        {shipping > 0 && freeShippingMessage}
                      </p>
                    </div>
                )}
              </motion.div>
            </>
        )}
      </AnimatePresence>
  )
}
