"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Tag, X, Check } from "lucide-react"

interface CouponInputProps {
  subtotal: number
  onCouponApplied: (discount: number, couponCode: string) => void
  onCouponRemoved: () => void
}

export default function CouponInput({ subtotal, onCouponApplied, onCouponRemoved }: CouponInputProps) {
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string
    discount: number
    type: string
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: "Enter a coupon code",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/coupons/validate?code=${encodeURIComponent(couponCode)}&subtotal=${subtotal}`)
      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Invalid coupon",
          description: data.error || "This coupon code is not valid",
          variant: "destructive",
        })
        return
      }

      if (data.success && data.coupon) {
        const discount = data.discount || 0
        setAppliedCoupon({
          code: couponCode,
          discount,
          type: data.coupon.discountType,
        })
        onCouponApplied(discount, couponCode)
        
        toast({
          title: "Coupon applied!",
          description: `You saved ₦${discount.toFixed(2)}`,
        })
      }
    } catch (error) {
      console.error("Error applying coupon:", error)
      toast({
        title: "Error",
        description: "Failed to apply coupon. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode("")
    onCouponRemoved()
    toast({
      title: "Coupon removed",
    })
  }

  if (appliedCoupon) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-900">
                Coupon "{appliedCoupon.code}" applied
              </p>
              <p className="text-xs text-green-700">
                You saved ₦{appliedCoupon.discount.toFixed(2)}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={removeCoupon}
            className="text-green-700 hover:text-green-900 hover:bg-green-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="coupon" className="flex items-center gap-2">
        <Tag className="h-4 w-4" />
        Have a coupon code?
      </Label>
      <div className="flex gap-2">
        <Input
          id="coupon"
          placeholder="Enter coupon code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              applyCoupon()
            }
          }}
          disabled={loading}
          className="uppercase"
        />
        <Button
          onClick={applyCoupon}
          disabled={loading || !couponCode.trim()}
          className="shrink-0"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Applying...
            </>
          ) : (
            "Apply"
          )}
        </Button>
      </div>
    </div>
  )
}
