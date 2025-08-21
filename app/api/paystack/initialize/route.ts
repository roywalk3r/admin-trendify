import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { z } from "zod"
import { paystackInitialize } from "@/lib/paystack"
import prisma from "@/lib/prisma"
// Shipping helpers now sourced from DB (DeliveryCity/PickupLocation)

const bodySchema = z.object({
  amount: z.coerce.number().positive(), // in major unit (e.g., NGN)
  email: z.string().email(),
  // Ignore client-provided currency to avoid merchant mismatch; server decides
  currency: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  addressId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const parsed = bodySchema.safeParse(await req.json())
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

    const { amount, email, metadata, addressId } = parsed.data

    // Validate delivery selection from metadata
    const delivery = (metadata as any)?.delivery as { method?: string; pickupCity?: string | null; pickupLocation?: string | null }
    const method = (delivery?.method || "pickup").toString() as "pickup" | "door"
    if (method === "pickup") {
      const cityName = String(delivery?.pickupCity || "").trim()
      const locName = String(delivery?.pickupLocation || "").trim()
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
    // If delivery is door-to-door, require an address that belongs to the user
    let address: any = null
    if (method === "door") {
      if (!addressId) return NextResponse.json({ error: "addressId is required for door delivery" }, { status: 400 })
      address = await prisma.address.findFirst({ where: { id: addressId, userId } })
      if (!address) return NextResponse.json({ error: "Invalid address", details: "Address not found for user" }, { status: 400 })
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY
    const publicUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_VERCEL_URL || "http://localhost:3000"
    if (!secretKey) return NextResponse.json({ error: "PAYSTACK_SECRET_KEY not set" }, { status: 500 })

    // Decide currency on server based on merchant setup. Prefer env.
    const serverCurrency = (process.env.PAYSTACK_CURRENCY || process.env.NEXT_PUBLIC_CURRENCY || "GHS").toUpperCase()
    // Optionally limit channels via env (comma-separated). If unset, let Paystack decide.
    const channelsEnv = process.env.PAYSTACK_CHANNELS
    const channels = channelsEnv
      ? channelsEnv.split(",").map((s) => s.trim()).filter(Boolean)
      : undefined

    const reference = `TREND-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

    // Compute server-side shipping and total amount to charge
    let shippingFee = 0
    if (method === "pickup") {
      shippingFee = 0
    } else {
      // door delivery: compute city fee from DB using address city
      const cityName = String(address?.city || "").trim()
      if (cityName) {
        const city = await prisma.deliveryCity.findFirst({ where: { name: { equals: cityName, mode: "insensitive" }, isActive: true } })
        shippingFee = city ? Number(city.doorFee) : Number(process.env.DEFAULT_DOOR_FEE || 35)
      } else {
        shippingFee = Number(process.env.DEFAULT_DOOR_FEE || 35)
      }
    }
    const totalAmount = Number(amount) // client included shipping; we still include normalized metadata with server fee

    const initPayload: any = {
      email,
      amount: Math.round((Number(totalAmount)) * 100), // kobo; server decides
      currency: serverCurrency,
      reference,
      callback_url: `${publicUrl}/checkout/confirm`,
      metadata: {
        ...metadata,
        userId,
        addressId: method === "door" ? addressId : undefined,
        // include a snapshot of the shipping address only for door delivery
        addressSnapshot: method === "door" && address
          ? {
              fullName: address.fullName,
              street: address.street,
              city: address.city,
              state: address.state,
              zipCode: address.zipCode,
              country: address.country,
              phone: address.phone,
            }
          : undefined,
        delivery: { method, pickupCity: delivery?.pickupCity || null, pickupLocation: delivery?.pickupLocation || null, fee: shippingFee },
        reference,
      },
    }
    if (channels && channels.length > 0) {
      initPayload.channels = channels
    }

    const init = await paystackInitialize(secretKey, initPayload)

    if (!init.status || !init.data) {
      return NextResponse.json({ error: init.message || "Failed to initialize payment" }, { status: 400 })
    }

    return NextResponse.json({
      data: {
        authorization_url: init.data.authorization_url,
        reference: init.data.reference,
      },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal Server Error" }, { status: 500 })
  }
}
