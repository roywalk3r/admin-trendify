import { NextRequest, NextResponse } from "next/server"
import { withCors, handleOptions } from "@/lib/cors"

export async function OPTIONS(req: NextRequest) { return handleOptions(req, { credentials: false }) }

export async function GET(req: NextRequest) {
  const spec = {
    openapi: "3.0.0",
    info: { title: "Trendify Mobile API", version: "1.0.0" },
    servers: [{ url: new URL(req.url).origin }],
    paths: {
      "/api/mobile/v1/auth/session": { get: { summary: "Get session" } },
      "/api/mobile/v1/auth/push-token": { post: { summary: "Register push token" }, delete: { summary: "Unregister push token" } },
      "/api/mobile/v1/products": { get: { summary: "List products" } },
      "/api/mobile/v1/categories": { get: { summary: "List categories" } },
      "/api/mobile/v1/cart": { get: { summary: "Get cart" }, post: { summary: "Add to cart" }, patch: { summary: "Update cart item" }, delete: { summary: "Remove or clear cart" } },
      "/api/mobile/v1/wishlist": { get: { summary: "Get wishlist" }, post: { summary: "Add to wishlist" }, delete: { summary: "Remove from wishlist" } },
      "/api/mobile/v1/orders": { get: { summary: "List orders" }, post: { summary: "Create order" } },
      "/api/mobile/v1/orders/{id}": { get: { summary: "Get order by id" } },
      "/api/mobile/v1/coupons/validate": { get: { summary: "Validate coupon and compute discount" } },
      "/api/mobile/v1/returns": { get: { summary: "List returns" }, post: { summary: "Create return" } },
      "/api/mobile/v1/returns/{id}": { get: { summary: "Get return by id" } },
      "/api/mobile/v1/reviews": { get: { summary: "List reviews" }, post: { summary: "Create review" } },
      "/api/mobile/v1/reviews/{id}": { delete: { summary: "Delete review" } },
      "/api/mobile/v1/profile": { get: { summary: "Get profile" }, put: { summary: "Update profile" } },
      "/api/mobile/v1/profile/addresses": { get: { summary: "List addresses" }, post: { summary: "Create address" } },
      "/api/mobile/v1/profile/addresses/{id}": { put: { summary: "Update address" }, delete: { summary: "Delete address" } },
      "/api/mobile/v1/hero": { get: { summary: "Get hero slides" } },
      "/api/mobile/v1/search": { get: { summary: "Search" } },
      "/api/mobile/v1/newsletter": { post: { summary: "Subscribe newsletter" } },
      "/api/mobile/v1/stock-alerts": { post: { summary: "Subscribe stock alerts" } },
      "/api/mobile/v1/payments/init": { post: { summary: "Initialize payment" } },
      "/api/mobile/v1/payments/verify": { post: { summary: "Verify payment" } },
      "/api/mobile/v1/payments/transactions": { get: { summary: "List payment transactions" } },
      "/api/mobile/v1/delivery/cities": { get: { summary: "List active delivery cities" } },
      "/api/mobile/v1/delivery/cities/{id}/pickup-locations": { get: { summary: "List active pickup locations for city" } },
    },
  }
  const res = NextResponse.json(spec, { status: 200 })
  return withCors(res, req, { credentials: false })
}
