"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, Bell } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@clerk/nextjs"

interface StockBadgeProps {
  stock: number
  lowStockThreshold?: number
  productId: string
  productName: string
}

export default function StockBadge({ stock, lowStockThreshold = 10, productId, productName }: StockBadgeProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { user } = useUser()

  const notifyWhenAvailable = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) {
      toast({
        title: "Sign in required",
        description: "Please sign in to get notified when this product is back in stock",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/stock-alerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          email: user.primaryEmailAddress.emailAddress,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "You're on the list!",
          description: `We'll email you when ${productName} is back in stock`,
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to set up stock alert",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to set up stock alert. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Out of stock
  if (stock === 0) {
    return (
      <div className="space-y-3">
        <Badge variant="destructive" className="text-sm font-semibold">
          <AlertCircle className="mr-1 h-4 w-4" />
          Out of Stock
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={notifyWhenAvailable}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            "Setting up alert..."
          ) : (
            <>
              <Bell className="mr-2 h-4 w-4" />
              Notify When Available
            </>
          )}
        </Button>
      </div>
    )
  }

  // Low stock warning
  if (stock <= lowStockThreshold) {
    return (
      <Badge variant="outline" className="border-orange-500 text-orange-700 bg-orange-50">
        <AlertCircle className="mr-1 h-3 w-3" />
        Only {stock} left in stock!
      </Badge>
    )
  }

  // In stock
  return (
    <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50">
      In Stock ({stock} available)
    </Badge>
  )
}
