# Migration Guide - Trendify v2.0

**Run these commands to apply all database changes and complete the setup.**

---

## Step 1: Generate Prisma Client

```bash
npx prisma generate
```

This regenerates the Prisma Client with the new models:
- `GuestSession`
- `StockAlert`
- `AbandonedCart`
- `Return`

---

## Step 2: Run Database Migration

### Option A: Create Migration (Development)

```bash
npx prisma migrate dev --name add_essential_features
```

This will:
1. Create a new migration file
2. Apply the migration to your database
3. Update Prisma Client

### Option B: Apply Existing Migration (Production)

```bash
npx prisma migrate deploy
```

This will apply migrations without prompts (safe for CI/CD).

### Option C: Push Schema (Quick Development)

```bash
npx prisma db push
```

⚠️ **Warning:** This directly updates the database without creating a migration file. Only use in development.

---

## Step 3: Verify Migration

```bash
# Open Prisma Studio to verify new tables
npx prisma studio
```

Check for these new tables:
- ✅ `guest_sessions`
- ✅ `stock_alerts`
- ✅ `abandoned_carts`
- ✅ `returns`

---

## Step 4: Update Environment Variables

Add these to your `.env` file:

```bash
# Cron job security (required)
CRON_SECRET="your-random-secret-here"

# Email service (optional but recommended)
RESEND_API_KEY="re_xxxxx"
FROM_EMAIL="orders@yourdomain.com"

# Logging level
LOG_LEVEL="info"
```

Generate CRON_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Step 5: Test New Features

### Test Guest Checkout

```bash
curl -X POST http://localhost:3000/api/checkout/guest \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "items": [{
      "productId": "your-product-id",
      "quantity": 1
    }],
    "shippingAddress": {
      "fullName": "John Doe",
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "US",
      "phone": "5555555555"
    }
  }'
```

**Expected:** 201 Created with session data

### Test Stock Alerts

```bash
curl -X POST http://localhost:3000/api/stock-alerts \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "productId": "your-product-id"
  }'
```

**Expected:** 201 Created

### Test Abandoned Cart Cron

```bash
curl -X GET http://localhost:3000/api/cron/abandoned-carts \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**Expected:** 200 OK with job results

---

## Rollback (If Needed)

If something goes wrong, you can rollback:

```bash
# Rollback last migration
npx prisma migrate resolve --rolled-back add_essential_features

# Or reset database (⚠️ DELETES ALL DATA)
npx prisma migrate reset
```

---

## Troubleshooting

### Issue: "Prisma schema has been modified"

**Solution:**
```bash
npx prisma generate
```

### Issue: "Migration failed"

**Solution:**
```bash
# Check what went wrong
npx prisma migrate status

# If migration is partially applied, resolve it
npx prisma migrate resolve --applied add_essential_features
```

### Issue: "Cannot connect to database"

**Solution:**
1. Check `DATABASE_URL` in `.env`
2. Ensure PostgreSQL is running
3. Test connection:
```bash
npx prisma db pull
```

### Issue: Type errors after migration

**Solution:**
```bash
# Regenerate Prisma Client
npx prisma generate

# Restart TypeScript server in your editor
# VSCode: Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

---

## Verification Checklist

After migration, verify:

- [ ] Prisma Client generated successfully
- [ ] Migration applied to database
- [ ] New tables visible in Prisma Studio
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] Application builds (`npm run build`)
- [ ] Dev server starts (`npm run dev`)
- [ ] Guest checkout API responds
- [ ] Stock alerts API responds
- [ ] Sitemap accessible (`/sitemap.xml`)
- [ ] Robots.txt accessible (`/robots.txt`)

---

## Production Deployment

### Before Deploying

1. ✅ Run migration in staging first
2. ✅ Test all new endpoints
3. ✅ Verify email service (RESEND_API_KEY)
4. ✅ Set CRON_SECRET
5. ✅ Backup production database

### Deploy Command (Vercel)

```bash
# Deploy with migrations
vercel --prod
```

Migrations run automatically via `prisma generate` in `postinstall` script.

### Manual Production Migration

If deploying elsewhere:

```bash
# 1. Build application
npm run build

# 2. Apply migrations
DATABASE_URL="production-url" npx prisma migrate deploy

# 3. Start production server
npm start
```

---

## Database Schema Changes Summary

### New Models

**1. GuestSession**
- Stores guest checkout sessions
- Auto-expires after 24 hours
- Enables checkout without account

**2. StockAlert**
- Email subscriptions for out-of-stock products
- Tracks notification status
- Enables back-in-stock alerts

**3. AbandonedCart**
- Tracks abandoned shopping carts
- Stores reminder count
- Enables cart recovery emails

**4. Return**
- Complete returns management
- Status workflow (pending → approved → received → refunded)
- Tracks refund amounts and restock fees

### New Enum

**ReturnStatus:**
- `pending` - Awaiting admin review
- `approved` - Approved by admin
- `rejected` - Rejected by admin
- `received` - Items received by warehouse
- `refunded` - Customer refunded
- `completed` - Return process complete

---

## Next Steps After Migration

1. **Configure Email Service**
   - Sign up at https://resend.com
   - Get API key
   - Add to `.env`
   - Verify domain

2. **Test Email Templates**
   - Trigger guest checkout
   - Check email inbox
   - Verify HTML renders correctly

3. **Configure Cron Jobs**
   - Set up Vercel cron (automatic)
   - Or use external cron service
   - Test manually first

4. **Monitor Logs**
   - Check structured logs
   - Verify sensitive data redacted
   - Monitor error rates

5. **Performance Testing**
   - Test rate limiting (429 on 6th request)
   - Check Redis connection
   - Monitor API response times

---

## Support

If you encounter issues:

1. Check the logs: `npm run dev` (watch console)
2. Review documentation: `/docs/` folder
3. Check Prisma docs: https://www.prisma.io/docs
4. Open GitHub issue with error details

---

**Migration Status:** Ready to apply ✅  
**Estimated Time:** 10-15 minutes  
**Risk Level:** Low (reversible)

**Last Updated:** October 21, 2025
