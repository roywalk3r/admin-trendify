# 🌍 Translation System - Quick Setup Guide

## Current Issue: Why translations aren't working

You're seeing raw keys like `home.categories.tagline` because:
1. ❌ Gemini API key not configured
2. ❌ Translation cache table not created in database  
3. ❌ Translations not pre-seeded

## ✅ Fix in 3 Steps

### Step 1: Configure Gemini API Key
```bash
# Add to .env or .env.local
GEMINI_API_KEY=your_api_key_here
```

**Get your free API key**: https://aistudio.google.com/app/apikey

### Step 2: Create Database Table
```bash
# Run migration to create TranslationCache table
pnpm prisma migrate dev --name add_translation_cache

# Regenerate Prisma client
pnpm prisma generate
```

### Step 3: Seed All Translations
```bash
# Make sure dev server is running
pnpm dev

# In another terminal, seed translations (takes 2-3 minutes)
pnpm i18n:seed
```

### Step 4: Restart & Test
```bash
# Stop dev server (Ctrl+C)
# Start it again
pnpm dev

# Open http://localhost:3000
# Click language dropdown → Select Spanish/French/etc
# Should now show translated text!
```

## ✨ What You Get

- **6 Languages**: English, French, Spanish, Chinese, Hindi, Arabic
- **RTL Support**: Arabic automatically uses right-to-left layout
- **Instant Switching**: After first seed, language switches are immediate
- **Smart Fallback**: Missing translations show English instead of raw keys
- **Auto-Cache**: Translations stored in database + JSON files

## 🔍 Check Translation Status

```bash
# See translation coverage per language
pnpm i18n:status

# Or visit in browser:
# http://localhost:3000/api/i18n/status
```

Example output:
```json
{
  "totalKeys": 127,
  "locales": [
    { "locale": "en", "count": 127, "percentage": 100 },
    { "locale": "fr", "count": 127, "percentage": 100 },
    { "locale": "es", "count": 127, "percentage": 100 },
    { "locale": "zh", "count": 94, "percentage": 74 },
    { "locale": "hi", "count": 0, "percentage": 0 },
    { "locale": "ar", "count": 0, "percentage": 0 }
  ]
}
```

## 🛠️ Troubleshooting

### Still seeing raw keys after setup?
```bash
# 1. Verify API key is set
echo $GEMINI_API_KEY

# 2. Check database table exists
pnpm prisma studio
# → Look for "TranslationCache" model

# 3. Check server logs for errors
# Look for lines starting with [i18n]

# 4. Hard refresh browser
# Cmd+Shift+R (Mac) or Ctrl+Shift+F5 (Windows)
```

### Language switcher doesn't navigate?
- Check browser console for errors
- Ensure middleware allows locale prefixes
- Verify `lib/i18n/config.ts` has all 6 locales

### Translations are slow?
- First-time translation generation takes time (normal)
- Pre-seed using `pnpm i18n:seed` to avoid runtime delays
- Subsequent loads are instant (cached)

## 📚 Full Documentation

See [docs/AI_TRANSLATION_GUIDE.md](./docs/AI_TRANSLATION_GUIDE.md) for:
- Architecture details
- API endpoints
- Adding new languages
- Custom translation workflows
- Performance optimization

## 🚀 Production Deployment

```bash
# Add to your CI/CD pipeline before build:
pnpm prisma migrate deploy
pnpm i18n:seed  # Pre-seed translations
pnpm build

# Set environment variables:
GEMINI_API_KEY=your_production_key
DATABASE_URL=your_production_db
```

## 💡 Quick Commands

```bash
pnpm i18n:seed      # Seed all translations
pnpm i18n:status    # Check translation coverage
pnpm db:studio      # View translation cache in database
```

---

**Need help?** Check the console logs in your terminal and browser DevTools for detailed error messages.
PGSSLMODE=disable \
psql \
-h 127.0.0.1 \
-p 5433 \
-d postgres \
-f ./db/tese_aerk_comm_projectmail811_9e43_h_aivencloud_com-2025_10_25_07_33_14-dump.sql

sed -i '/^BEGIN;$/a TRUNCATE TABLE \
public.analytics_events, \
public.audit_logs, \
public.cart_items, \
public.carts, \
public.categories, \
public.coupons, \
public.delivery_cities, \
public.drivers, \
public.guest_sessions, \
public.hero_slides, \
public.newsletter_subscriptions, \
public.order_items, \
public.orders, \
public.payments, \
public.pickup_locations, \
public.product_tags, \
public.product_variants, \
public.products, \
public.refunds, \
public.returns, \
public.reviews, \
public.settings, \
public.shipping_addresses, \
public.stock_alerts, \
public.tags, \
public.translation_cache, \
public.users, \
public.wishlist_items, \
public.wishlists \
CASCADE;' prisma/migrations/data.sql && PGSSLMODE=disable psql -h 127.0.0.1 -p 5433 -d postgres --set ON_ERROR_STOP=on -f ./prisma/migrations/data.sql