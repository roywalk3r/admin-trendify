import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { paystackVerify, isPaystackTxSuccess, type PaystackTransaction } from "@/lib/paystack"
// Shipping validation now uses DeliveryCity/PickupLocation from DB
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    // Allow verification view even if not signed-in (coming from Paystack redirect), but prefer signed in
    const url = new URL(req.url)
    const reference = url.searchParams.get("reference")

    if (!reference) return NextResponse.json({ error: "reference is required" }, { status: 400 })

    const secretKey = process.env.PAYSTACK_SECRET_KEY
    if (!secretKey) return NextResponse.json({ error: "PAYSTACK_SECRET_KEY not set" }, { status: 500 })

    const res = await paystackVerify(secretKey, reference)

    if (!res.status || !res.data) {
      return NextResponse.json({ error: res.message || "Verification failed" }, { status: 400 })
    }

    // Persist to DB (idempotent): create Order + Payment if not exists
    const tx: PaystackTransaction = res.data!
    const payStatus: string = tx.status
    const isSuccessful = isPaystackTxSuccess(tx)
    const currency = (tx.currency || "NGN").toString().toUpperCase()
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
        return NextResponse.json({ error: "Invalid pickup selection" }, { status: 400 })
      }
      const city = await prisma.deliveryCity.findFirst({
        where: { name: { equals: cityName, mode: "insensitive" }, isActive: true },
        include: { pickupLocations: { where: { isActive: true } } },
      })
      if (!city || !city.pickupLocations.some((p) => p.name.toLowerCase() === locName.toLowerCase())) {
        return NextResponse.json({ error: "Invalid pickup selection" }, { status: 400 })
      }
    }
    const email: string | undefined = tx?.customer?.email || tx?.metadata?.email
    const items: Array<any> = Array.isArray(tx?.metadata?.items) ? tx.metadata.items : []

    // If we already have an order for this reference, return it
    const existingOrder = await prisma.order.findFirst({ where: { orderNumber: reference }, include: { payment: true, orderItems: true } })
    if (existingOrder) {
      return NextResponse.json({ data: { ...tx, order: existingOrder } })
    }

    // Ensure user exists (prefer direct id from metadata, fallback to email)
    let dbUser = null as any
    if (userIdFromMeta) {
      dbUser = await prisma.user.findFirst({ where: { id: userIdFromMeta } })
    }
    if (!dbUser && email) {
      dbUser = await prisma.user.findFirst({ where: { email } })
    }
    if (!dbUser) {
      // Create minimal user using email if available
      const fallbackEmail = email || `guest-${reference}@example.local`
      const nameFromEmail = fallbackEmail.split("@")[0]
      dbUser = await prisma.user.create({
        data: {
          id: userIdFromMeta || undefined,
          email: fallbackEmail,
          name: nameFromEmail || "Guest",
          role: "customer",
          isVerified: true,
        },
      })
    }

    // Compute totals from items (fallbacks to transaction amount if mismatch)
    const computedSubtotal = items.reduce((sum, it) => {
      const p = typeof it.price === "string" ? parseFloat(it.price) : Number(it.price || 0)
      const q = typeof it.quantity === "string" ? parseInt(it.quantity) : Number(it.quantity || 0)
      return sum + (isFinite(p) ? p : 0) * (isFinite(q) ? q : 0)
    }, 0)
    const subtotal = Number.isFinite(computedSubtotal) && computedSubtotal > 0 ? computedSubtotal : amountMajor
    // Compute shipping from DB: pickup = 0; door uses address city
    let shipping = 0
    if (deliveryMethod === "door") {
      // We'll use the address city after we resolve finalAddress/snapshot below; temporarily 0
    }
    const tax = 0
    const discount = 0
    const totalAmount = subtotal + tax + shipping - discount

    // Create Order + OrderItems + Payment within a transaction
    const order = await prisma.$transaction(async (txdb) => {
      const order = await txdb.order.create({
        data: {
          orderNumber: reference,
          userId: dbUser.id,
          status: isSuccessful ? "processing" : "pending",
          paymentStatus: isSuccessful ? "paid" : "unpaid",
          subtotal: subtotal,
          tax: tax,
          shipping: shipping,
          discount: discount,
          totalAmount: totalAmount,
        },
      })

      if (items.length > 0) {
        // Only create OrderItems for products that actually exist to satisfy FK constraints
        const ids = items.map((it) => String(it.id)).filter(Boolean)
        const existing = await txdb.product.findMany({ where: { id: { in: ids } }, select: { id: true } })
        const existingSet = new Set(existing.map((p) => p.id))
        const validItems = items.filter((it) => existingSet.has(String(it.id)))

        if (validItems.length > 0) {
          const orderItemsData = validItems.map((it) => {
            const p = typeof it.price === "string" ? parseFloat(it.price) : Number(it.price || 0)
            const q = typeof it.quantity === "string" ? parseInt(it.quantity) : Number(it.quantity || 0)
            const total = (isFinite(p) ? p : 0) * (isFinite(q) ? q : 0)
            return {
              orderId: order.id,
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
          await txdb.orderItem.createMany({ data: orderItemsData })
        } else {
          // Attach a note if no items could be persisted due to FK
          await txdb.order.update({ where: { id: order.id }, data: { notes: `Order created without items: products not found for reference ${reference}` } })
        }
      }

      await txdb.payment.create({
        data: {
          orderId: order.id,
          amount: totalAmount,
          currency: currency,
          method: "paystack",
          status: isSuccessful ? "paid" : "failed",
          transactionId: String(tx.id || reference),
          gatewayFee: gatewayFee || null,
          metadata: { ...tx, delivery: deliveryMeta },
          paidAt: isSuccessful ? new Date(tx.paid_at || tx.paidAt || Date.now()) : null,
          failedAt: !isSuccessful ? new Date() : null,
          failureReason: !isSuccessful ? tx.gateway_response || tx.message || null : null,
        },
      })

      // Attach shipping address from metadata only for door delivery
      let finalAddress: any = null
      if (deliveryMethod === "door" && addressIdFromMeta) {
        finalAddress = await txdb.address.findFirst({ where: { id: addressIdFromMeta, userId: dbUser.id } })
      }
      const snapshot = finalAddress
        ? {
            fullName: finalAddress.fullName,
            street: finalAddress.street,
            city: finalAddress.city,
            state: finalAddress.state,
            zipCode: finalAddress.zipCode,
            country: finalAddress.country,
            phone: finalAddress.phone,
          }
        : deliveryMethod === "door" && addressSnapshot && typeof addressSnapshot === "object"
        ? {
            fullName: String(addressSnapshot.fullName || ""),
            street: String(addressSnapshot.street || ""),
            city: String(addressSnapshot.city || ""),
            state: String(addressSnapshot.state || ""),
            zipCode: String(addressSnapshot.zipCode || ""),
            country: String(addressSnapshot.country || ""),
            phone: String(addressSnapshot.phone || ""),
          }
        : null

      // Now that we know the city for door delivery, compute shipping from DeliveryCity
      if (deliveryMethod === "door") {
        const cityName = String(finalAddress?.city || snapshot?.city || "").trim()
        if (cityName) {
          const city = await txdb.deliveryCity.findFirst({ where: { name: { equals: cityName, mode: "insensitive" }, isActive: true } })
          shipping = city ? Number(city.doorFee) : Number(process.env.DEFAULT_DOOR_FEE || 35)
        } else {
          shipping = Number(process.env.DEFAULT_DOOR_FEE || 35)
        }
      }

      if (snapshot && snapshot.fullName && snapshot.street) {
        await txdb.shippingAddress.create({
          data: {
            orderId: order.id,
            ...snapshot,
          },
        })
      }

      return order
    })

    // Load order with relations for receipt rendering
    const fullOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: { payment: true, orderItems: true },
    })

    return NextResponse.json({ data: { ...res.data, order: fullOrder } })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal Server Error" }, { status: 500 })
  }
}
