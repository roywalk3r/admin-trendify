import { NextRequest } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { paystackVerify, isPaystackTxSuccess, type PaystackTransaction } from "@/lib/paystack"
import { sendOrderConfirmationEmail } from "@/lib/email"
// Shipping validation now uses DeliveryCity/PickupLocation from DB
import prisma from "@/lib/prisma"
import { createApiResponse, handleApiError } from "@/lib/api-utils"

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    // Allow verification view even if not signed-in (coming from Paystack redirect), but prefer signed in
    const url = new URL(req.url)
    const reference = url.searchParams.get("reference")

    if (!reference) return createApiResponse({ error: "reference is required", status: 400 })

    const secretKey = process.env.PAYSTACK_SECRET_KEY
    if (!secretKey) return createApiResponse({ error: "PAYSTACK_SECRET_KEY not set", status: 500 })

    const res = await paystackVerify(secretKey, reference)

    if (!res.status || !res.data) {
      return createApiResponse({ error: res.message || "Verification failed", status: 400 })
    }

    // Persist to DB (idempotent): create Order + Payment if not exists
    const tx: PaystackTransaction = res.data!
    const payStatus: string = tx.status
    const isSuccessful = isPaystackTxSuccess(tx)
    const currency = (tx.currency || process.env.PAYSTACK_CURRENCY || process.env.NEXT_PUBLIC_CURRENCY || "GHS").toString().toUpperCase()
    const amountMajor = (tx.amount ?? tx.requested_amount ?? 0) / 100 // Paystack returns minor unit
    const gatewayFee = (tx.fees ?? 0) / 100
    const userIdFromMeta: string | undefined = tx?.metadata?.userId
    const addressIdFromMeta: string | undefined = tx?.metadata?.addressId
    const addressSnapshot: any = tx?.metadata?.addressSnapshot
    const deliveryMeta: any = tx?.metadata?.delivery || {}
    const deliveryMethod: "pickup" | "door" = (deliveryMeta?.method || "pickup").toString()
    if (deliveryMethod === "pickup") {
      const cityName = String(deliveryMeta?.pickupCity || "").trim()
      const locName = String(deliveryMeta?.pickupLocation || "").trim()
      if (!cityName || !locName) {
        return createApiResponse({ error: "Invalid pickup selection", status: 400 })
      }
      const city = await prisma.deliveryCity.findFirst({
        where: { name: { equals: cityName, mode: "insensitive" }, isActive: true },
        include: { pickupLocations: { where: { isActive: true } } },
      })
      if (!city || !city.pickupLocations.some((p) => p.name.toLowerCase() === locName.toLowerCase())) {
        return createApiResponse({ error: "Invalid pickup selection", status: 400 })
      }
    }
    const email: string | undefined = tx?.customer?.email || tx?.metadata?.email
    const items: Array<any> = Array.isArray(tx?.metadata?.items) ? tx.metadata.items : []

    // If we already have an order for this reference, ensure items exist and return it
    const existingOrder = await prisma.order.findFirst({ where: { orderNumber: reference }, include: { payment: true, orderItems: { include: { product: { select: { images: true } } } }, user: true } })
    if (existingOrder) {
      try {
        if ((existingOrder.orderItems?.length || 0) === 0 && items.length > 0) {
          const ids = items.map((it) => String(it.id)).filter(Boolean)
          const existing = await prisma.product.findMany({ where: { id: { in: ids } }, select: { id: true } })
          const existingSet = new Set(existing.map((p) => p.id))
          const validItems = items.filter((it) => existingSet.has(String(it.id)))
          if (validItems.length > 0) {
            const orderItemsData = validItems.map((it) => {
              const p = typeof it.price === "string" ? parseFloat(it.price) : Number(it.price || 0)
              const q = typeof it.quantity === "string" ? parseInt(it.quantity) : Number(it.quantity || 0)
              const total = (isFinite(p) ? p : 0) * (isFinite(q) ? q : 0)
              return {
                orderId: existingOrder.id,
                productId: String(it.id),
                variantId: undefined,
                quantity: isFinite(q) && q > 0 ? q : 1,
                unitPrice: isFinite(p) && p > 0 ? p : 0,
                totalPrice: total,
                productName: it.name || "Item",
                productSku: it.sku || null,
                productData: it,
              }
            })
            await prisma.orderItem.createMany({ data: orderItemsData })
            }
          }
        } catch {}
        const refreshed = await prisma.order.findUnique({ where: { id: existingOrder.id }, include: { payment: true, orderItems: { include: { product: { select: { images: true } } } }, user: true } })
        return createApiResponse({ data: { ...tx, order: refreshed || existingOrder }, status: 200 })
      }

    // No existing order by reference; use metadata.orderId to locate and update order
    const orderIdMeta: string | undefined = (tx?.metadata as any)?.orderId
    if (!orderIdMeta) {
      return createApiResponse({ status: 400, error: "Missing orderId in transaction metadata" })
    }

    const order = await prisma.order.findUnique({ where: { id: orderIdMeta }, include: { payment: true, orderItems: { include: { product: { select: { images: true } } } }, user: true } })
    if (!order) {
      return createApiResponse({ status: 404, error: "Order not found" })
    }

    // Mark payment and order as paid when Paystack reports success
    if (isSuccessful) {
      await prisma.payment.upsert({
        where: { orderId: order.id },
        update: {
          status: "paid",
          amount: Number(order.totalAmount),
          currency,
          transactionId: tx.reference || tx.id?.toString?.() || undefined,
          metadata: {
            ...(order.payment?.metadata as any || {}),
            verify: tx,
          },
        },
        create: {
          orderId: order.id,
          method: "paystack",
          status: "paid",
          amount: Number(order.totalAmount),
          currency,
          transactionId: tx.reference || tx.id?.toString?.() || undefined,
          metadata: { verify: tx },
        },
      })

      const updated = await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: "paid", status: order.status === "pending" ? "processing" : order.status },
        include: { payment: true, orderItems: { include: { product: { select: { images: true } } } }, user: true },
      })

      // Send confirmation email after payment
      try {
        if (email) {
          await sendOrderConfirmationEmail(email, {
            orderNumber: updated.orderNumber,
            customerName: updated.user?.name || (email?.split("@")[0] || "Customer"),
            items: updated.orderItems.map((it) => ({ name: it.productName, quantity: it.quantity, price: Number(it.unitPrice), image: (it as any)?.product?.images?.[0] })),
            subtotal: Number(updated.subtotal),
            tax: Number(updated.tax),
            shipping: Number(updated.shipping),
            total: Number(updated.totalAmount),
            estimatedDelivery: updated.estimatedDelivery ? new Date(updated.estimatedDelivery).toLocaleDateString() : undefined,
          })
        }
      } catch (e) {
        console.warn("[email] order confirmation send failed", e)
      }

      return createApiResponse({ status: 200, data: { ...res.data, order: updated } })
    }

    // Not successful
    return createApiResponse({ status: 200, data: { ...res.data, order } })
  } catch (e: any) {
    return handleApiError(e)
  }
}
