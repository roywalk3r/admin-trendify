import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { logInfo } from "@/lib/logger"

const stockAlertSchema = z.object({
  email: z.string().email("Invalid email address"),
  productId: z.string().min(1, "Product ID is required"),
  variantId: z.string().optional(),
})

// Create stock alert
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, productId, variantId } = stockAlertSchema.parse(body)

    // Check if product exists and is actually out of stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, stock: true },
    })

    if (!product) {
      return createApiResponse({
        error: "Product not found",
        status: 404,
      })
    }

    if (product.stock > 0) {
      return createApiResponse({
        error: "Product is currently in stock",
        status: 400,
      })
    }

    // Check if alert already exists
    const existingAlert = await prisma.stockAlert.findFirst({
      where: {
        email,
        productId,
        variantId,
        notified: false,
      },
    })

    if (existingAlert) {
      return createApiResponse({
        data: { message: "You're already signed up for stock alerts for this product" },
        status: 200,
      })
    }

    // Create stock alert
    const alert = await prisma.stockAlert.create({
      data: {
        email,
        productId,
        variantId,
      },
    })

    logInfo("Stock alert created", { email, productId, alertId: alert.id })

    return createApiResponse({
      data: {
        message: "You'll be notified when this product is back in stock",
        alertId: alert.id,
      },
      status: 201,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// Delete stock alert (unsubscribe)
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const email = url.searchParams.get("email")
    const productId = url.searchParams.get("productId")

    if (!email || !productId) {
      return createApiResponse({
        error: "Email and productId are required",
        status: 400,
      })
    }

    await prisma.stockAlert.deleteMany({
      where: {
        email,
        productId,
        notified: false,
      },
    })

    logInfo("Stock alert deleted", { email, productId })

    return createApiResponse({
      data: { message: "Stock alert removed successfully" },
      status: 200,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
