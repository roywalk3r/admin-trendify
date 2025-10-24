# API Reference Overview

This document lists key public and admin API endpoints and expected request/response formats. Use this as a starting point; expand per team needs.

## Conventions
- All JSON responses follow: `{ data: T | null, error: string | string[] | null }`.
- Rate limiting enforced via Redis; expect 429 on excess.
- Auth: Clerk JWT/session for protected routes.

## Public Endpoints

### Products
- GET `/api/products` — List products
- GET `/api/products/[id]` — Product details

### Cart
- POST `/api/cart/sync` — Merge guest cart with user cart on sign-in
  - Body: `{ guestCartItems: Array<{ id, name, price, quantity, color?, size?, image }> }`
  - 200: `{ data: { items: CartItem[] }, error: null }`
- GET `/api/cart/sync` — Get authenticated user's cart

### Checkout (Guest)
- POST `/api/checkout/guest` — Create guest checkout session
  - Body: `{ email, items: [{ productId, quantity, variantId? }], shippingAddress: {...} }`
  - 201: `{ data: { sessionId, orderNumber, summary: {...} } }`

### Stock Alerts
- POST `/api/stock-alerts` — Subscribe to back-in-stock alerts
- DELETE `/api/stock-alerts?email=...&productId=...` — Unsubscribe

### SEO
- GET `/sitemap.xml`
- GET `/robots.txt`

## Admin Endpoints (Auth Required)

### Returns
- GET `/api/admin/returns?status=&page=&limit=` — List returns with counts
- GET `/api/admin/returns/[id]` — Return details
- PATCH `/api/admin/returns/[id]` — Update status
  - Body: `{ action: 'approve'|'reject'|'mark_received'|'mark_refunded', adminNotes?, restockFee?, shippingCost?, returnLabel? }`

## Error Format
```json
{
  "data": null,
  "error": "Human readable error message or array"
}
```

## Rate Limit Guidance
- Use `checkRateLimit(identifier, limit, windowInSeconds)` in server routes.
- Identify by userId or IP for anonymous requests.

## Webhooks (Planned)
- Clerk user events
- Paystack/Stripe payment events
- Shipping carrier updates

## Notes
- See `docs/TESTING_AND_CI_STRATEGY.md` for testing guidance.
- See `docs/INCIDENT_RESPONSE.md` for incident process.
