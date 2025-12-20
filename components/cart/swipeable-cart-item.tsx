"use client"

import { useState, useRef } from "react"
import { motion, PanInfo, useMotionValue, useTransform } from "framer-motion"
import { Trash2, Heart, Minus, Plus, ArrowLeft, ArrowRight } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCartStore } from "@/lib/store/cart-store"
import { useToast } from "@/hooks/use-toast"
import { useCurrency } from "@/lib/contexts/settings-context"
import { useMediaQuery } from "@/hooks/use-media-query"

interface SwipeableCartItemProps {
  item: {
    id: string
    name: string
    price: number
    quantity: number
    image: string
    color?: string
    size?: string
    variantId?: string
  }
  onRemove?: (itemId: string) => void
  onMoveToWishlist?: (item: any) => void
  onUpdateQuantity?: (itemId: string, quantity: number) => void
}

export default function SwipeableCartItem({
  item,
  onRemove,
  onMoveToWishlist,
  onUpdateQuantity
}: SwipeableCartItemProps) {
  const [isRemoving, setIsRemoving] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { format } = useCurrency()
  const { toast } = useToast()
  const constraintsRef = useRef(null)

  const x = useMotionValue(0)
  const opacity = useTransform(x, [-150, -75, 0, 75, 150], [0.5, 0.8, 1, 0.8, 0.5])
  const scale = useTransform(x, [-150, -75, 0, 75, 150], [0.9, 0.95, 1, 0.95, 0.9])

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100
    
    if (Math.abs(info.offset.x) > threshold) {
      if (info.offset.x < -threshold) {
        // Swiped left - remove item
        handleRemove()
      } else if (info.offset.x > threshold) {
        // Swiped right - move to wishlist
        handleMoveToWishlist()
      }
    }
    
    // Reset position if threshold not met
    x.set(0)
  }

  const handleRemove = async () => {
    if (isRemoving) return
    
    setIsRemoving(true)
    try {
      onRemove?.(item.id)
      toast({
        title: "Item removed",
        description: `${item.name} has been removed from your cart`
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive"
      })
      setIsRemoving(false)
    }
  }

  const handleMoveToWishlist = async () => {
    try {
      onMoveToWishlist?.(item)
      onRemove?.(item.id)
      toast({
        title: "Moved to wishlist",
        description: `${item.name} has been moved to your wishlist`
      })
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to move item to wishlist",
        variant: "destructive"
      })
    }
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemove()
      return
    }
    
    onUpdateQuantity?.(item.id, newQuantity)
  }

  if (isRemoving) {
    return (
      <motion.div
        initial={{ opacity: 1, height: "auto" }}
        animate={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      />
    )
  }

  return (
    <div ref={constraintsRef} className="relative">
      {/* Swipe Action Background (Mobile Only) */}
      {isMobile && (
        <div className="absolute inset-0 flex items-center justify-between px-4 rounded-lg">
          {/* Right swipe action - Move to Wishlist */}
          <div className="flex items-center space-x-2 text-blue-600">
            <Heart className="h-5 w-5" />
            <span className="text-sm font-medium">Wishlist</span>
          </div>
          
          {/* Left swipe action - Remove */}
          <div className="flex items-center space-x-2 text-red-600">
            <span className="text-sm font-medium">Remove</span>
            <Trash2 className="h-5 w-5" />
          </div>
        </div>
      )}

      {/* Main Cart Item */}
      <motion.div
        style={{ x, opacity, scale }}
        drag={isMobile ? "x" : false}
        dragConstraints={constraintsRef}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        whileDrag={{ cursor: "grabbing" }}
        className="relative z-10"
      >
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center space-x-4 p-4">
              {/* Product Image */}
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm text-foreground line-clamp-1 mb-1">
                  {item.name}
                </h3>
                
                {/* Variant Info */}
                {(item.color || item.size) && (
                  <div className="flex gap-2 mb-2">
                    {item.color && (
                      <Badge variant="outline" className="text-xs">
                        {item.color}
                      </Badge>
                    )}
                    {item.size && (
                      <Badge variant="outline" className="text-xs">
                        {item.size}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Price and Quantity Controls */}
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-lg text-foreground">
                    {format(item.price * item.quantity)}
                  </span>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleQuantityChange(item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleQuantityChange(item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Unit Price */}
                <p className="text-xs text-muted-foreground mt-1">
                  {format(item.price)} each
                </p>
              </div>

              {/* Desktop Actions */}
              {!isMobile && (
                <div className="flex flex-col space-y-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-blue-600"
                    onClick={handleMoveToWishlist}
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-red-600"
                    onClick={handleRemove}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Swipe Instructions (First Time) */}
            {isMobile && !showActions && (
              <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ delay: 3, duration: 1 }}
                className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-20"
              >
                <div className="flex items-center space-x-4 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full">
                  <div className="flex items-center space-x-1">
                    <ArrowRight className="h-3 w-3" />
                    <span>Swipe for wishlist</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ArrowLeft className="h-3 w-3" />
                    <span>Swipe to remove</span>
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
