# Schema Migration Guide - Product Coupons & Drivers

## Overview
This migration adds product-specific and category-specific coupons, plus driver management for deliveries.

## Database Changes

### 1. Coupon Model Updates
- **Added**: `productId` (optional) - Link coupons to specific products
- **Added**: `categoryId` (optional) - Link coupons to specific categories
- **Added**: Relations to `Product` and `Category` models
- **Added**: Indexes on `productId` and `categoryId`

### 2. Order Model Updates
- **Added**: `driverId` (optional) - Assign delivery driver to orders
- **Added**: `deliveredAt` - Actual delivery timestamp
- **Added**: Relation to `Driver` model
- **Added**: Index on `driverId`

### 3. New Driver Model
Fields:
- `id`, `name`, `phone`, `email`, `licenseNo`, `vehicleType`, `vehicleNo`
- `isActive`, `rating`, `totalTrips`
- `createdAt`, `updatedAt`
- Relation to `Order[]`

### 4. Product & Category Relations
- `Product.coupons` - One-to-many with Coupon
- `Category.coupons` - One-to-many with Coupon

## Migration Steps

### Step 1: Create Migration
```bash
npx prisma migrate dev --name add_product_coupons_and_drivers
```

### Step 2: Apply Migration
```bash
npx prisma migrate deploy
```

### Step 3: Regenerate Prisma Client
```bash
npx prisma generate
```

### Step 4: Verify Schema
```bash
npx prisma studio
```

## API Changes

### Coupons API
**GET /api/admin/coupons**
- New query params: `productId`, `categoryId`, `scope` (global/product/category)
- Response includes `product` and `category` relations

**POST /api/admin/coupons**
- New fields: `productId`, `categoryId` (optional)

**PATCH /api/admin/coupons/[id]**
- New fields: `productId`, `categoryId` (optional)

### New Drivers API
**GET /api/admin/drivers**
- List all drivers with filters (search, active status)
- Returns driver details with order count

**POST /api/admin/drivers**
- Create new driver
- Required: name, phone, licenseNo, vehicleType, vehicleNo

**GET /api/admin/drivers/[id]**
- Get driver details

**PATCH /api/admin/drivers/[id]**
- Update driver details

**DELETE /api/admin/drivers/[id]**
- Delete driver

## UI Changes

### Admin Coupons Page
- Added product and category selectors in coupon form
- Shows scope (Global/Product/Category) in coupon list
- Supports filtering by product/category

### New Admin Drivers Page
- `/admin/drivers` - Full CRUD for delivery drivers
- Shows driver stats (trips, rating, status)
- Filter by active status, search

### Admin Sidebar
- Delivery section now has submenu:
  - Delivery Config
  - Drivers

## Usage Examples

### Create Product-Specific Coupon
```typescript
// 20% off a specific product
{
  code: "SHIRT20",
  type: "percentage",
  value: 20,
  productId: "prod_123",
  categoryId: null,
  startDate: "2025-01-01",
  endDate: "2025-12-31",
  isActive: true
}
```

### Create Category-Wide Coupon
```typescript
// $10 off electronics category
{
  code: "TECH10",
  type: "fixed_amount",
  value: 10,
  productId: null,
  categoryId: "cat_electronics",
  startDate: "2025-01-01",
  endDate: "2025-12-31",
  isActive: true
}
```

### Assign Driver to Order
```typescript
await prisma.order.update({
  where: { id: orderId },
  data: { 
    driverId: "driver_123",
    status: "shipped"
  }
})
```

## Rollback Instructions

If you need to rollback this migration:

```bash
# Revert the migration
npx prisma migrate resolve --rolled-back <migration-name>

# Or manually:
# 1. Remove the added columns/tables from database
# 2. Revert schema.prisma changes
# 3. Run: npx prisma generate
```

## Testing Checklist

- [ ] Run migration successfully
- [ ] Create global coupon
- [ ] Create product-specific coupon
- [ ] Create category-specific coupon
- [ ] Verify coupon filtering works
- [ ] Create driver
- [ ] Assign driver to order
- [ ] Verify driver stats update
- [ ] Test driver CRUD operations

## Notes

- Coupons can be global (no productId/categoryId), product-specific, or category-specific
- Only one scope (product OR category) should be set, not both
- Drivers can be inactive but still linked to historical orders (onDelete: SetNull)
- Rating is optional and can be updated after trips
