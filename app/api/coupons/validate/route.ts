import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const subtotalStr = searchParams.get("subtotal")
    const userId = searchParams.get("userId")

    if (!code) {
      return NextResponse.json(
        { success: false, error: "Coupon code is required" },
        { status: 400 }
      )
    }

    const subtotal = Number(subtotalStr) || 0

    // Find coupon by code
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: "Invalid coupon code" },
        { status: 404 }
      )
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return NextResponse.json(
        { success: false, error: "This coupon is no longer active" },
        { status: 400 }
      )
    }

    // Check validity window (startDate/endDate)
    const now = new Date()
    if (coupon.startDate && now < new Date(coupon.startDate)) {
      return NextResponse.json(
        { success: false, error: "This coupon is not active yet" },
        { status: 400 }
      )
    }
    if (coupon.endDate && now > new Date(coupon.endDate)) {
      return NextResponse.json(
        { success: false, error: "This coupon has expired" },
        { status: 400 }
      )
    }

    // Check usage limit (global)
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json(
        { success: false, error: "This coupon has reached its usage limit" },
        { status: 400 }
      )
    }

    // Check per-user limit when userId is provided
    if (coupon.perUserLimit && userId) {
      const usedByUser = await prisma.order.count({
        where: { userId, couponId: coupon.id },
      })
      if (usedByUser >= coupon.perUserLimit) {
        return NextResponse.json(
          { success: false, error: "You have reached the usage limit for this coupon" },
          { status: 400 }
        )
      }
    }

    // Check minimum purchase amount
    if (coupon.minPurchase && subtotal < Number(coupon.minPurchase)) {
      return NextResponse.json(
        {
          success: false,
          error: `Minimum purchase amount of ₦${Number(coupon.minPurchase).toFixed(2)} required`,
        },
        { status: 400 }
      )
    }

    // Calculate discount
    let discount = 0
    if (coupon.type === "percentage") {
      discount = (subtotal * Number(coupon.value)) / 100

      // Apply max discount cap if set
      if (coupon.maxDiscount && discount > Number(coupon.maxDiscount)) {
        discount = Number(coupon.maxDiscount)
      }
    } else if (coupon.type === "fixed_amount") {
      discount = Number(coupon.value)
      
      // Don't allow discount to exceed subtotal
      if (discount > subtotal) {
        discount = subtotal
      }
    }

    return NextResponse.json({
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description || null,
        type: coupon.type,
        value: Number(coupon.value),
        minPurchase: coupon.minPurchase ? Number(coupon.minPurchase) : null,
        maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null,
        usageLimit: coupon.usageLimit ?? null,
        usageCount: coupon.usageCount,
        startDate: coupon.startDate,
        endDate: coupon.endDate,
      },
      discount,
      finalAmount: Math.max(0, subtotal - discount),
    })
  } catch (error) {
    console.error("Error validating coupon:", error)
    return NextResponse.json(
      { success: false, error: "Failed to validate coupon" },
      { status: 500 }
    )
  }
}
