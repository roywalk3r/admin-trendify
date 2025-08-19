import { NextRequest } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { createApiResponse } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return createApiResponse({ status: 500, error: "Missing PAYSTACK_SECRET_KEY env" });
  }

  // Get raw body for signature verification
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  if (!signature) {
    return createApiResponse({ status: 400, error: "Missing x-paystack-signature header" });
  }

  const computed = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
  if (computed !== signature) {
    return createApiResponse({ status: 401, error: "Invalid signature" });
  }

  // Safe to parse after verification
  const payload = JSON.parse(rawBody) as any;
  const event = payload?.event as string | undefined;
  const data = payload?.data as any;

  if (!event || !data) {
    return createApiResponse({ status: 400, error: "Invalid webhook payload" });
  }

  const reference: string | undefined = data.reference;
  const metadata = (data.metadata || {}) as { orderId?: string };
  const orderId = metadata.orderId;

  if (!reference || !orderId) {
    // We rely on both to correlate the payment
    return createApiResponse({ status: 400, error: "Missing reference or orderId in metadata" });
  }

  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return createApiResponse({ status: 404, error: "Order not found" });
    }

    // Ensure payment row exists
    const payment = await prisma.payment.upsert({
      where: { orderId },
      update: {},
      create: {
        orderId,
        amount: order.totalAmount,
        currency: (process.env.PAYSTACK_CURRENCY || "NGN").toUpperCase(),
        method: "paystack",
        status: "unpaid",
      },
    });

    // Idempotency: if already paid, acknowledge
    if (payment.status === "paid") {
      return createApiResponse({ status: 200, data: { ok: true } });
    }

    // Verify transaction with Paystack
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}` , {
      headers: { Authorization: `Bearer ${secret}` },
      cache: "no-store",
    });

    const verifyJson = (await verifyRes.json()) as any;
    if (!verifyRes.ok || !verifyJson.status) {
      // Could not verify; acknowledge to stop retries but do not update to paid
      return createApiResponse({ status: 200, data: { ok: true } });
    }

    const v = verifyJson.data;
    const status: string = v.status; // 'success' | 'failed' | ...

    const orderAmountKobo = Math.round(Number(order.totalAmount) * 100);
    const paidAmount: number = v.amount; // already in kobo
    const currency = (v.currency || "NGN").toUpperCase();

    if (status === "success" && paidAmount >= orderAmountKobo) {
      const now = new Date();
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "paid",
          transactionId: reference,
          currency,
          gatewayFee: v.fees != null ? String(Number(v.fees) / 100) as any : undefined,
          paidAt: now,
          metadata: {
            ...(payment.metadata as object),
            verify: v,
          },
        },
      });

      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: "paid" },
      });

      return createApiResponse({ status: 200, data: { ok: true } });
    }

    if (status === "failed" || status === "abandoned") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "failed",
          failedAt: new Date(),
          failureReason: v.gateway_response || v.message || "Payment failed",
          transactionId: reference,
          metadata: {
            ...(payment.metadata as object),
            verify: v,
          },
        },
      });
      return createApiResponse({ status: 200, data: { ok: true } });
    }

    // Unhandled status; store verify payload for investigation
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        transactionId: reference,
        metadata: {
          ...(payment.metadata as object),
          verify: v,
        },
      },
    });

    return createApiResponse({ status: 200, data: { ok: true } });
  } catch (err) {
    // Do not throw 5xx to avoid repeated retries; log via console or observability tool.
    console.error("Paystack webhook error:", err);
    return createApiResponse({ status: 200, data: { ok: true } });
  }
}
