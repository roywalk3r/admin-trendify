# Database Migration Commands

**CRITICAL:** Run these commands before testing the new admin features.

---

## 1. Check Current Migration Status

```bash
npx prisma migrate status
```

This will show you which migrations have been applied.

---

## 2. Run the Migration

```bash
npx prisma migrate dev --name add_all_admin_features
```

This creates and applies a migration that includes:
- Driver model (for delivery management)
- Coupon.productId and Coupon.categoryId (product-specific coupons)
- Order.driverId and Order.deliveredAt fields
- All necessary indexes

---

## 3. Regenerate Prisma Client

```bash
npx prisma generate
```

This updates the TypeScript types for the new schema.

---

## 4. Verify in Database

```bash
npx prisma studio
```

Opens a web UI to browse your database and verify:
- `drivers` table exists
- `coupons` table has `product_id` and `category_id` columns
- `orders` table has `driver_id` and `delivered_at` columns
- All indexes are present

---

## 5. (Optional) Seed Database

If you want test data:

```bash
npx prisma db seed
```

Or create custom seed data for testing the new features.

---

## If Migration Fails

### Option A: Reset Database (DEV ONLY)
```bash
npx prisma migrate reset
```
⚠️ **WARNING:** This DELETES ALL DATA. Only use in development.

### Option B: Push Schema (DEV ONLY)
```bash
npx prisma db push
```
Applies schema changes without creating a migration file.

### Option C: Fix Conflicts Manually
1. Check the error message
2. Fix schema conflicts
3. Delete failed migration from `prisma/migrations`
4. Run migration again

---

## Production Migration

For production deployment:

```bash
# On production server/environment
npx prisma migrate deploy
```

This applies all pending migrations without prompts.

---

## Verify Everything Works

After migration, test these admin pages:
- `/admin/coupons` - Create a product-specific coupon
- `/admin/drivers` - Add a delivery driver
- `/admin/guests` - View guest sessions (if any exist)
- `/admin/abandoned-carts` - Check recovery metrics
- `/admin/stock-alerts` - View pending alerts
- `/admin/reviews` - Moderate reviews
- `/admin/refunds` - Process refunds

---

## Rollback (If Needed)

```bash
# Revert last migration
npx prisma migrate resolve --rolled-back <migration-name>

# Or manually revert schema and run:
npx prisma migrate dev --create-only
```

---

**Run these commands NOW to enable all new features!**
