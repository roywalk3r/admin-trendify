# AI Translation System Guide

## Overview
This application uses AI-powered translation (Google Gemini) to automatically translate the entire site into multiple languages:
- **Supported languages**: English (en), French (fr), Spanish (es), Chinese (zh), Hindi (hi), Arabic (ar)
- **RTL support**: Arabic automatically uses right-to-left text direction
- **Caching**: Translations are cached in both Prisma DB and JSON files for fast loading

## Setup

### 1. Configure Gemini API Key
Add to your `.env` or `.env.local`:
```env
GEMINI_API_KEY=your_api_key_here
# OR
GOOGLE_AI_API_KEY=your_api_key_here
```

Get your API key from: https://aistudio.google.com/app/apikey

### 2. Run Prisma Migration
The translation cache requires a database table:
```bash
pnpm prisma migrate dev --name add_translation_cache
pnpm prisma generate
```

### 3. Seed Translations (Optional but Recommended)
Pre-translate all keys for all locales:
```bash
# Make sure your dev server is running first
npm run dev

# In another terminal:
npx tsx scripts/seed-translations.ts
```

This will take a few minutes but ensures instant translation on first visit for all languages.

## How It Works

### On-Demand Translation
- When a user switches to a new language, translations are generated automatically
- First visit may show English fallback while translations load in background
- Subsequent visits are instant (served from cache)

### Translation Flow
1. **User switches language** → Dropdown triggers navigation to `/[locale]/...`
2. **Server loads dictionary** → Merges: English base + locale file + AI cache
3. **Missing keys** → Fall back to English text
4. **Background preseed** → Gradually fills cache for next visit

### Cache Hierarchy
1. **Memory** (fastest, runtime only)
2. **Prisma DB** (persistent, primary)
3. **JSON file** (`lib/i18n/cache/<locale>.json`) - fallback

## Architecture

### Key Files
- `lib/i18n/config.ts` - Locale configuration
- `lib/i18n/dictionaries.ts` - Dictionary loading + caching
- `lib/i18n/ai-translate.ts` - AI translation logic
- `app/api/i18n/preseed/route.ts` - Bulk translation endpoint
- `app/api/i18n/translate/route.ts` - Single-key translation
- `components/language-switcher.tsx` - UI for switching languages

### Database Schema
```prisma
model TranslationCache {
  id        String   @id @default(cuid())
  locale    String   @db.VarChar(10)
  key       String   @db.VarChar(255)
  value     String   @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([locale, key])
  @@index([locale])
}
```

## Usage in Code

### Server Components
```tsx
import { getDictionary } from "@/lib/i18n/dictionaries"

export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const dict = await getDictionary(locale)
  
  return <h1>{dict.home.hero.title}</h1>
}
```

### Client Components
```tsx
"use client"
import { useI18n } from "@/lib/i18n/I18nProvider"

export function MyComponent() {
  const { t } = useI18n()
  return <button>{t("common.submit")}</button>
}
```

## Adding New Translation Keys

1. **Add to English dictionary** (`lib/i18n/dictionaries/en.json`):
```json
{
  "mySection": {
    "myKey": "My English text"
  }
}
```

2. **Use in your component**:
```tsx
{t("mySection.myKey")}
```

3. **AI will auto-translate** on first use in each locale

## Troubleshooting

### Translations show as keys (e.g., "home.categories.title")
- **Cause**: AI key not configured or preseed not run yet
- **Fix**: 
  1. Set `GEMINI_API_KEY` in `.env`
  2. Restart dev server
  3. Run `npx tsx scripts/seed-translations.ts`
  4. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+F5)

### Language switching is slow
- **Cause**: First-time translation generation
- **Fix**: Pre-seed translations using the script above
- **Note**: After first generation, switching is instant

### Some keys show English in other languages
- **Cause**: Translation failed or key not in cache yet
- **Expected**: System falls back to English gracefully
- **Fix**: Will be translated on next preseed or after retry

### Prisma errors on translation
- **Cause**: `TranslationCache` table doesn't exist
- **Fix**: Run `pnpm prisma migrate dev`

### API rate limits from Gemini
- **Cause**: Too many concurrent translation requests
- **Fix**: Concurrency is already limited to 5. Consider:
  - Spreading out preseed over time
  - Using Gemini API Pro tier
  - Pre-seeding during deployment, not runtime

## Best Practices

1. **Pre-seed in CI/CD**: Add translation seeding to your deployment pipeline
2. **Monitor Gemini usage**: Watch your API quotas in Google AI Studio
3. **Version control caches**: Commit `lib/i18n/cache/*.json` files to git for faster builds
4. **Test RTL**: Always test Arabic layout for UI/UX issues
5. **Fallback gracefully**: English fallback ensures site is always usable

## API Endpoints

### POST `/api/i18n/translate`
Translate a single key on-demand
```bash
curl -X POST http://localhost:3000/api/i18n/translate \
  -H "Content-Type: application/json" \
  -d '{"key": "home.hero.title", "targetLang": "es"}'
```

### POST `/api/i18n/preseed`
Bulk-translate all keys for a locale
```bash
curl -X POST http://localhost:3000/api/i18n/preseed \
  -H "Content-Type: application/json" \
  -d '{"targetLang": "es", "sourceLang": "en"}'
```

## Performance

- **Cold start** (no cache): ~2-5s per locale (first time only)
- **Warm cache**: <100ms (instant)
- **Memory footprint**: ~1MB per locale in cache
- **Database**: ~1 row per translation key per locale

## Future Enhancements

- [ ] Translation quality voting
- [ ] Manual override interface for AI translations
- [ ] Batch export/import for professional translation services
- [ ] Translation change detection (revalidate on English key changes)
- [ ] Locale-specific formatting (dates, numbers, currency)
