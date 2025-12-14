import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { createApiResponse, handleApiError } from "@/lib/api-utils";
import { getCurrencyCode } from "@/lib/settings";

export const dynamic = "force-dynamic";

// Initialize a Paystack transaction for an existing order
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, email, callbackUrl, delivery, addressId, shippingFee, items } = body as {
      orderId: string;
      email: string;
      callbackUrl?: string;
      delivery?: { method?: string; pickupCity?: string | null; pickupLocation?: string | null };
      addressId?: string | null;
      shippingFee?: number;
      items?: Array<{ id: string; name?: string; sku?: string | null; price: number; quantity: number; image?: string | null }>;
    };

    if (!orderId || !email) {
      return createApiResponse({ status: 400, error: "orderId and email are required" });
    }

    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
    if (!PAYSTACK_SECRET_KEY) {
      return createApiResponse({ status: 500, error: "Missing PAYSTACK_SECRET_KEY env" });
    }

    const currency = await getCurrencyCode();

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return createApiResponse({ status: 404, error: "Order not found" });
    }

    // Amount in the smallest currency unit (kobo/pesewas)
    const amountKobo = Math.round(Number(order.totalAmount) * 100);
    if (amountKobo <= 0) {
      return createApiResponse({ status: 400, error: "Order amount must be greater than zero" });
    }

    // Ensure a payment record exists (one-to-one with order)
    const payment = await prisma.payment.upsert({
      where: { orderId: order.id },
      update: {
        method: "paystack",
        status: "unpaid",
      },
      create: {
        orderId: order.id,
        amount: order.totalAmount,
        currency,
        method: "paystack",
        status: "unpaid",
      },
    });

    // Build reference and metadata to help match in webhook
    const reference = `${order.orderNumber}-${Date.now()}`;

    const initRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: amountKobo,
        currency,
        reference,
        callback_url: callbackUrl || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout/confirm`,
        metadata: {
          orderId: order.id,
          reference,
          // include delivery details so /api/paystack/verify can validate pickup
          delivery: delivery ? {
            method: (delivery.method || "pickup").toString(),
            pickupCity: delivery.pickupCity ?? null,
            pickupLocation: delivery.pickupLocation ?? null,
          } : undefined,
          addressId: addressId || undefined,
          shippingFee: typeof shippingFee === "number" ? shippingFee : undefined,
          email,
          // include a trimmed snapshot of items for verification/receipt
          items: Array.isArray(items) ? items.map((it) => ({
            id: String(it.id),
            name: it.name,
            sku: it.sku ?? null,
            price: Number(it.price),
            quantity: Number(it.quantity),
            image: it.image || null,
          })) : undefined,
        },
      }),
    });

    const initJson = (await initRes.json()) as any;
    if (!initRes.ok || !initJson.status) {
      const message = initJson?.message || "Failed to initialize Paystack transaction";
      return createApiResponse({ status: 502, error: message });
    }

    const authUrl = initJson.data.authorization_url as string;
    const accessCode = initJson.data.access_code as string;

    // Persist reference and init payload on payment
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        transactionId: reference,
        metadata: {
          ...(payment.metadata as object),
          init: initJson.data,
        },
      },
    });

    return createApiResponse({
      status: 200,
      data: { authorization_url: authUrl, access_code: accessCode, reference },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
