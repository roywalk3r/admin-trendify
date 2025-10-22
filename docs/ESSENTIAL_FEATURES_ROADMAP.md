# Trendify - Essential E-commerce Features Roadmap

**Timeline:** 6-8 weeks  
**Priority:** Features required for competitive e-commerce platform  
**Status:** Implementation Required

---

## Overview

This document outlines **47 essential e-commerce features** missing from Trendify, organized by priority and implementation phase. Each feature includes business impact, technical requirements, and implementation guidance.

---

## Phase 1: Core Shopping Experience (Weeks 2-3)

### 1. Guest Checkout 🔴 CRITICAL

**Business Impact:** Requiring login reduces conversions by 20-30%

**Current State:** Checkout requires Clerk authentication

**Implementation:**

1. **Database Schema** - Add to `prisma/schema.prisma`:
```prisma
model GuestSession {
  id        String   @id @default(cuid())
  sessionId String   @unique @map("session_id")
  email     String   @db.VarChar(255)
  cartData  Json
  createdAt DateTime @default(now()) @map("created_at")
  expiresAt DateTime @map("expires_at")
  
  @@index([sessionId])
  @@index([email])
  @@map("guest_sessions")
}

model GuestOrder {
  id          String        @id @default(cuid())
  sessionId   String        @map("session_id")
  email       String        @db.VarChar(255)
  orderNumber String        @unique @map("order_number")
  status      OrderStatus   @default(pending)
  totalAmount Decimal       @map("total_amount") @db.Decimal(12, 2)
  subtotal    Decimal       @db.Decimal(12, 2)
  tax         Decimal       @db.Decimal(12, 2)
  shipping    Decimal       @db.Decimal(12, 2)
  items       Json
  shippingAddress Json
  createdAt   DateTime      @default(now()) @map("created_at")
  
  @@index([sessionId])
  @@index([email])
  @@map("guest_orders")
}
```

2. **API Route** - Create `/app/api/checkout/guest/route.ts`
3. **Frontend** - Create `/app/checkout/guest/page.tsx`
4. **Session Management** - Use cookies or localStorage for guest cart

**Testing:**
- Complete purchase without logging in
- Email confirmation sent to guest
- Order trackable via email link
- Post-purchase account creation offer

---

### 2. Stock Notifications 🟡 HIGH

**Business Impact:** Capture lost sales from out-of-stock items

**Database Schema:**
```prisma
model StockAlert {
  id         String    @id @default(cuid())
  email      String    @db.VarChar(255)
  productId  String    @map("product_id")
  variantId  String?   @map("variant_id")
  notified   Boolean   @default(false)
  createdAt  DateTime  @default(now()) @map("created_at")
  notifiedAt DateTime? @map("notified_at")
  
  @@index([productId])
  @@index([email])
  @@index([notified])
  @@map("stock_alerts")
}
```

**Implementation:**
1. Add "Notify Me" button to out-of-stock products
2. Create API endpoint `/api/stock-alerts` (POST, DELETE)
3. Background job to check stock and send notifications
4. Email template for stock alert

**Backend Logic:**
```typescript
// In product update/restock logic
if (newStock > 0 && previousStock === 0) {
  const alerts = await prisma.stockAlert.findMany({
    where: { productId, notified: false }
  })
  
  for (const alert of alerts) {
    await sendStockAlertEmail(alert.email, product)
    await prisma.stockAlert.update({
      where: { id: alert.id },
      data: { notified: true, notifiedAt: new Date() }
    })
  }
}
```

---

### 3. Wishlist Sharing 🟢 MEDIUM

**Current State:** Wishlist exists but can't be shared

**Enhancement:**
1. Generate shareable link for wishlists
2. Public wishlist view (read-only)
3. Social sharing buttons
4. Privacy settings (public/private)

**Database Schema Update:**
```prisma
model Wishlist {
  id         String    @id @default(cuid())
  userId     String    @unique @map("user_id")
  shareToken String?   @unique @map("share_token") // Add this
  isPublic   Boolean   @default(false) @map("is_public") // Add this
  // ... existing fields
}
```

**API Routes:**
- `GET /api/wishlist/share/[token]` - View shared wishlist
- `POST /api/wishlist/share` - Generate share link
- `DELETE /api/wishlist/share` - Revoke share link

---

### 4. Product Comparison 🟢 MEDIUM

**Business Impact:** Helps customers make informed decisions

**Features:**
- Compare up to 4 products side-by-side
- Show specs, features, prices, ratings
- Mobile-responsive comparison view
- Save/share comparisons

**Implementation:**
1. Create comparison store with Zustand
2. Add "Add to Compare" button on product cards
3. Create comparison page `/compare`
4. Floating comparison bar (shows selected products)

**File:** `/lib/store/compare-store.ts`
```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CompareStore {
  products: string[] // Product IDs
  addProduct: (id: string) => void
  removeProduct: (id: string) => void
  clearAll: () => void
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set) => ({
      products: [],
      addProduct: (id) => set((state) => ({
        products: state.products.length < 4 
          ? [...state.products, id] 
          : state.products
      })),
      removeProduct: (id) => set((state) => ({
        products: state.products.filter(p => p !== id)
      })),
      clearAll: () => set({ products: [] }),
    }),
    { name: 'compare-storage' }
  )
)
```

---

## Phase 2: Order Management (Weeks 3-4)

### 5. Order Tracking Integration 🔴 CRITICAL

**Current State:** Tracking number field exists but no real-time tracking

**Implementation:**
1. Choose carrier API (ShipStation, EasyPost, or Shippo)
2. Integrate tracking webhook
3. Create tracking page
4. Real-time status updates

**Recommended:** EasyPost (multi-carrier support)

```bash
npm install @easypost/api
```

**File:** `/lib/shipping/tracking.ts`
```typescript
import EasyPost from '@easypost/api'

const client = new EasyPost(process.env.EASYPOST_API_KEY!)

export async function getTrackingInfo(trackingNumber: string, carrier: string) {
  try {
    const tracker = await client.Tracker.create({
      tracking_code: trackingNumber,
      carrier: carrier,
    })
    
    return {
      status: tracker.status,
      estimatedDelivery: tracker.est_delivery_date,
      trackingHistory: tracker.tracking_details,
      currentLocation: tracker.tracking_location,
    }
  } catch (error) {
    console.error('Tracking error:', error)
    return null
  }
}

export async function subscribeToTrackingUpdates(trackingNumber: string) {
  // Set up webhook for tracking updates
  await client.Tracker.create({
    tracking_code: trackingNumber,
    // EasyPost will send webhooks on status changes
  })
}
```

**Webhook Handler:** `/app/api/webhooks/shipping/route.ts`

---

### 6. Order Modification 🟡 HIGH

**Feature:** Allow customers to modify orders before shipping

**Allowed Changes:**
- Cancel order (before processing)
- Update shipping address (before shipped)
- Add/remove items (within 1 hour of order)
- Change delivery speed

**Business Rules:**
```typescript
function canModifyOrder(order: Order): { 
  canCancel: boolean
  canEditAddress: boolean
  canEditItems: boolean
} {
  const hoursSinceOrder = (Date.now() - order.createdAt.getTime()) / (1000 * 60 * 60)
  
  return {
    canCancel: order.status === 'pending' || order.status === 'processing',
    canEditAddress: order.status !== 'shipped' && order.status !== 'delivered',
    canEditItems: hoursSinceOrder < 1 && order.status === 'pending',
  }
}
```

---

### 7. Invoice Generation 🟡 HIGH

**Current State:** No invoice download functionality

**Implementation:**
1. Install PDF generation library
```bash
npm install @react-pdf/renderer
```

2. Create invoice template
**File:** `/lib/invoice/template.tsx`

3. API endpoint to generate PDF
**File:** `/app/api/orders/[id]/invoice/route.ts`

4. Add "Download Invoice" button to order details

---

### 8. Returns & Refunds System 🔴 CRITICAL

**Business Impact:** Essential for customer trust and legal compliance

**Database Schema:**
```prisma
model Return {
  id              String       @id @default(cuid())
  orderId         String       @map("order_id")
  orderItemIds    String[]     @map("order_item_ids")
  reason          String
  reasonDetails   String?      @map("reason_details") @db.Text
  status          ReturnStatus @default(pending)
  refundAmount    Decimal      @map("refund_amount") @db.Decimal(12, 2)
  restockFee      Decimal?     @map("restock_fee") @db.Decimal(12, 2)
  shippingCost    Decimal?     @map("shipping_cost") @db.Decimal(12, 2)
  returnLabel     String?      @map("return_label") @db.VarChar(500)
  receivedDate    DateTime?    @map("received_date")
  refundedDate    DateTime?    @map("refunded_date")
  images          String[]     // Customer photos of damaged items
  adminNotes      String?      @map("admin_notes") @db.Text
  createdAt       DateTime     @default(now()) @map("created_at")
  updatedAt       DateTime     @updatedAt @map("updated_at")
  
  @@index([orderId])
  @@index([status])
  @@map("returns")
}

enum ReturnStatus {
  pending
  approved
  rejected
  received
  refunded
  completed
}
```

**Customer Flow:**
1. Go to order → Click "Return Items"
2. Select items to return + reason
3. Upload photos (if damaged)
4. Submit request
5. Receive return label via email
6. Ship items back
7. Refund processed upon receipt

**Admin Flow:**
1. Receive return request
2. Review reason + photos
3. Approve/Reject
4. Generate return label
5. Track return shipment
6. Inspect received items
7. Process refund

---

## Phase 3: Marketing & Conversion (Weeks 4-5)

### 9. Abandoned Cart Recovery 🔴 CRITICAL

**Business Impact:** Recovers 10-15% of abandoned carts

**Database Schema:**
```prisma
model AbandonedCart {
  id            String    @id @default(cuid())
  userId        String?   @map("user_id")
  email         String    @db.VarChar(255)
  cartData      Json
  cartValue     Decimal   @map("cart_value") @db.Decimal(12, 2)
  remindersSent Int       @default(0) @map("reminders_sent")
  recovered     Boolean   @default(false)
  recoveredAt   DateTime? @map("recovered_at")
  createdAt     DateTime  @default(now()) @map("created_at")
  lastReminder  DateTime? @map("last_reminder")
  
  @@index([email])
  @@index([recovered])
  @@map("abandoned_carts")
}
```

**Email Sequence:**
1. **1 hour:** "You left something behind" (reminder)
2. **24 hours:** "Still interested?" (with testimonials)
3. **48 hours:** "Last chance!" (with 10% discount code)

**Implementation:** Background job runs hourly

**File:** `/lib/jobs/abandoned-cart.ts`

---

### 10. Email Marketing Integration 🔴 CRITICAL

**Recommended:** Resend (modern, great DX) or SendGrid (enterprise)

```bash
npm install resend
```

**Email Types Needed:**
1. **Transactional**
   - Order confirmation
   - Shipping notification
   - Delivery confirmation
   - Password reset
   - Account created

2. **Marketing**
   - Welcome series (3 emails)
   - Abandoned cart (3 emails)
   - Post-purchase (review request)
   - Win-back campaign
   - Product launches
   - Sales notifications

**File:** `/lib/email/templates/order-confirmation.tsx`
```typescript
import { Html, Head, Body, Container, Heading, Text, Button } from '@react-email/components'

interface OrderConfirmationProps {
  orderNumber: string
  customerName: string
  items: any[]
  total: number
}

export function OrderConfirmationEmail({
  orderNumber,
  customerName,
  items,
  total,
}: OrderConfirmationProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'sans-serif' }}>
        <Container>
          <Heading>Thank you for your order!</Heading>
          <Text>Hi {customerName},</Text>
          <Text>Your order #{orderNumber} has been confirmed.</Text>
          {/* Order details */}
          <Button href={`https://yourdomain.com/orders/${orderNumber}`}>
            Track Your Order
          </Button>
        </Container>
      </Body>
    </Html>
  )
}
```

---

### 11. Product Reviews Moderation 🟡 HIGH

**Current State:** Review model exists but no moderation flow

**Implementation:**
1. Review submission form (already have model)
2. Moderation queue in admin
3. Auto-approve verified purchases
4. Spam detection
5. Review helpfulness voting

**Admin Interface:**
```typescript
// /app/admin/reviews/pending
- List of pending reviews
- Approve/Reject buttons
- Flag inappropriate content
- Edit review (typos only)
- Respond to review as merchant
```

**AI Enhancement:**
Use Google AI (already integrated) for:
- Spam detection
- Sentiment analysis
- Automatic moderation

---

### 12. SEO Optimization 🟡 HIGH

**Missing:**
- Dynamic sitemap
- Structured data
- Canonical URLs
- Social meta tags

**File:** `/app/sitemap.ts` (NEW - Next.js 14 format)
```typescript
import { MetadataRoute } from 'next'
import prisma from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.com'
  
  // Get all products
  const products = await prisma.product.findMany({
    where: { isActive: true, isDeleted: false },
    select: { slug: slug, updatedAt: true },
  })
  
  // Get all categories
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { slug: slug, updatedAt: true },
  })
  
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...products.map((product) => ({
      url: `${baseUrl}/products/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...categories.map((category) => ({
      url: `${baseUrl}/categories/${category.slug}`,
      lastModified: category.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ]
}
```

**File:** `/app/robots.ts` (NEW)
```typescript
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.com'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/checkout/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
```

**Add Structured Data:**
```typescript
// In product page
const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: product.name,
  image: product.images,
  description: product.description,
  sku: product.sku,
  offers: {
    "@type": "Offer",
    price: product.price,
    priceCurrency: "USD",
    availability: product.stock > 0 ? "InStock" : "OutOfStock",
  },
  aggregateRating: product.averageRating ? {
    "@type": "AggregateRating",
    ratingValue: product.averageRating,
    reviewCount: product.reviewCount,
  } : undefined,
}
```

---

## Phase 4: Advanced Features (Weeks 5-6)

### 13. Loyalty/Rewards Program 🟢 MEDIUM

**Database Schema:**
```prisma
model LoyaltyAccount {
  id          String          @id @default(cuid())
  userId      String          @unique @map("user_id")
  points      Int             @default(0)
  tier        LoyaltyTier     @default(bronze)
  lifetimePoints Int          @default(0) @map("lifetime_points")
  createdAt   DateTime        @default(now()) @map("created_at")
  transactions LoyaltyTransaction[]
  user        User            @relation(fields: [userId], references: [id])
  
  @@map("loyalty_accounts")
}

model LoyaltyTransaction {
  id          String   @id @default(cuid())
  accountId   String   @map("account_id")
  points      Int      // Can be negative for redemptions
  reason      String
  orderId     String?  @map("order_id")
  expiresAt   DateTime? @map("expires_at")
  createdAt   DateTime @default(now()) @map("created_at")
  account     LoyaltyAccount @relation(fields: [accountId], references: [id])
  
  @@index([accountId])
  @@map("loyalty_transactions")
}

enum LoyaltyTier {
  bronze
  silver
  gold
  platinum
}
```

**Points Rules:**
- 1 point per $1 spent
- Birthday bonus: 100 points
- Review product: 50 points
- Referral: 200 points
- Social share: 25 points

**Redemption:**
- 100 points = $5 off
- 500 points = Free shipping
- 1000 points = $50 off

---

### 14. Gift Cards 🟢 MEDIUM

**Database Schema:**
```prisma
model GiftCard {
  id          String         @id @default(cuid())
  code        String         @unique @db.VarChar(20)
  balance     Decimal        @db.Decimal(12, 2)
  initialValue Decimal       @map("initial_value") @db.Decimal(12, 2)
  purchasedBy String?        @map("purchased_by")
  recipientEmail String?     @map("recipient_email") @db.VarChar(255)
  expiresAt   DateTime       @map("expires_at")
  isActive    Boolean        @default(true) @map("is_active")
  createdAt   DateTime       @default(now()) @map("created_at")
  transactions GiftCardTransaction[]
  
  @@index([code])
  @@map("gift_cards")
}

model GiftCardTransaction {
  id         String   @id @default(cuid())
  cardId     String   @map("card_id")
  orderId    String?  @map("order_id")
  amount     Decimal  @db.Decimal(12, 2)
  type       String   // 'purchase', 'redemption', 'refund'
  createdAt  DateTime @default(now()) @map("created_at")
  card       GiftCard @relation(fields: [cardId], references: [id])
  
  @@index([cardId])
  @@map("gift_card_transactions")
}
```

---

### 15. Multi-Currency Support 🟢 MEDIUM

**Implementation:**
1. Currency selection dropdown
2. Store base currency in database
3. Fetch exchange rates daily
4. Display prices in selected currency
5. Checkout in selected currency

```bash
npm install @dinero.js/currencies dinero.js
```

**File:** `/lib/currency.ts`
```typescript
import { dinero, add, multiply, toDecimal } from 'dinero.js'
import { USD, EUR, GBP } from '@dinero.js/currencies'

const exchangeRates = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  // Fetch from API daily
}

export function convertPrice(
  amount: number,
  fromCurrency: string,
  toCurrency: string
) {
  const rate = exchangeRates[toCurrency] / exchangeRates[fromCurrency]
  return amount * rate
}
```

---

## Feature Priority Matrix

### Must Have (Before Launch)
1. ✅ Guest Checkout
2. ✅ Order Tracking
3. ✅ Email Notifications
4. ✅ Abandoned Cart Recovery
5. ✅ Returns & Refunds
6. ✅ Stock Notifications
7. ✅ Review Moderation
8. ✅ SEO Optimization

### Should Have (Within 3 months)
9. Product Comparison
10. Invoice Generation
11. Loyalty Program
12. Gift Cards
13. Wishlist Sharing
14. Order Modification

### Nice to Have (Future)
15. Multi-Currency
16. Advanced Analytics
17. A/B Testing
18. Personalization Engine
19. Live Chat Support

---

## Timeline Summary

| Week | Focus | Deliverables |
|------|-------|--------------|
| 1 | Critical Fixes | Code cleanup, security, logging |
| 2 | Guest Checkout | Guest orders, email capture |
| 3 | Order Management | Tracking, returns, invoices |
| 4 | Abandoned Carts | Email automation, recovery |
| 5 | Marketing | SEO, reviews, email marketing |
| 6 | Polish | Testing, optimization, docs |

---

## Success Metrics

Track these KPIs after implementation:

- **Conversion Rate:** Target >2% (guest checkout should help)
- **Cart Abandonment:** Target <70% (with recovery)
- **Email Open Rate:** Target >25%
- **Cart Recovery Rate:** Target 10-15%
- **Customer Satisfaction:** Target >4.5/5
- **Return Rate:** Target <5%

---

**Next Steps:**
1. Review and prioritize features with stakeholders
2. Assign features to sprints
3. Begin implementation starting with Week 2
4. Test each feature thoroughly before moving to next

**Document Updated:** October 21, 2025
