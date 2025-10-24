# Internationalization (i18n) Guide

This application supports internationalization using Next.js App Router best practices.

## Supported Locales

- English (`en`) - Default
- French (`fr`)

## How It Works

### URL Structure

All routes use the `[locale]` dynamic segment:
- `/en/` - English routes
- `/fr/` - French routes

Examples:
- `/en/products` → English products page
- `/fr/products` → French products page
- `/en/admin` → English admin dashboard
- `/fr/admin` → French admin dashboard

### File Structure

Routes are organized under `app/[locale]/`:
```
app/
├── [locale]/           # All localized routes
│   ├── layout.tsx     # Generates static params for locales
│   ├── page.tsx       # Home page
│   ├── products/      # Products routes
│   ├── admin/         # Admin dashboard
│   └── ...
├── api/               # API routes (no locale prefix)
├── layout.tsx         # Root layout
└── ...
```

### Automatic Redirects

- Visiting `/` redirects to `/en/` (default locale)
- API routes (`/api/*`) are NOT prefixed with locales
- All other routes must include a locale prefix

### Middleware

The middleware (`middleware.ts`) handles:
1. Redirecting root `/` to `/en/`
2. Protecting admin routes regardless of locale (`/[locale]/admin`)
3. Running Clerk authentication
4. Bot detection via Arcjet

## Adding Translations

### 1. Update Dictionary Files

Add translations to the JSON files:

**`lib/i18n/dictionaries/en.json`**
```json
{
  "common": {
    "welcome": "Welcome"
  }
}
```

**`lib/i18n/dictionaries/fr.json`**
```json
{
  "common": {
    "welcome": "Bienvenue"
  }
}
```

### 2. Server Components

For server components in `app/[locale]/`, use the `params.locale`:

```tsx
import { getDictionary } from "@/lib/i18n/dictionaries"
import type { Locale } from "@/lib/i18n/config"

export default async function Page({ params }: { params: { locale: Locale } }) {
  const dict = await getDictionary(params.locale)
  
  return <h1>{dict.common.welcome}</h1>
}
```

For nested layouts or pages:
```tsx
type Props = {
  params: { locale: Locale; [key: string]: string }
  children?: React.ReactNode
}

export default async function ProductLayout({ params, children }: Props) {
  const dict = await getDictionary(params.locale)
  
  return (
    <div>
      <h2>{dict.product.title}</h2>
      {children}
    </div>
  )
}
```

### 3. Client Components

For client components, use the `useLocale` hook and pass dictionaries as props:

```tsx
"use client"

import { useLocale } from "@/lib/i18n/use-translations"

export default function MyComponent({ dict }: { dict: any }) {
  const locale = useLocale()
  
  return (
    <div>
      <p>Current locale: {locale}</p>
      <p>{dict.common.welcome}</p>
    </div>
  )
}
```

Or use the `useTranslations` hook:

```tsx
"use client"

import { useTranslations } from "@/lib/i18n/use-translations"

export default function MyComponent({ dict }: { dict: any }) {
  const { t, locale } = useTranslations(dict)
  
  return (
    <div>
      <p>{t("common.welcome")}</p>
    </div>
  )
}
```

## Language Switcher

The `LanguageSwitcher` component is already integrated in the navigation bar. It:
- Detects the current locale from the URL
- Shows buttons for other available locales
- Preserves the current path when switching languages

Example: On `/en/products`, clicking "FR" navigates to `/fr/products`

## Adding a New Locale

1. **Update config** (`lib/i18n/config.ts`):
```typescript
export const locales = ["en", "fr", "es"] as const // Add "es"
```

2. **Create dictionary** (`lib/i18n/dictionaries/es.json`):
```json
{
  "common": {
    "home": "Inicio",
    ...
  }
}
```

3. **Update dictionaries.ts** (`lib/i18n/dictionaries.ts`):
```typescript
const dictionaries = {
  en: () => import("./dictionaries/en.json").then((module) => module.default),
  fr: () => import("./dictionaries/fr.json").then((module) => module.default),
  es: () => import("./dictionaries/es.json").then((module) => module.default),
}
```

4. **Update middleware** (if needed):
The middleware automatically picks up locales from `lib/i18n/config.ts`

5. **Restart dev server** to apply changes

## Best Practices

1. **Always use dictionary keys** instead of hardcoded strings
2. **Pass dictionaries down** from server to client components
3. **Use meaningful key hierarchies**: `product.addToCart` instead of `addToCartButton`
4. **Keep translations consistent** across locales
5. **Test all locales** before deploying

## Current Translation Coverage

The following sections have translations:
- Navigation menu items
- Footer links
- Product actions
- Checkout flow
- Common UI elements

## To-Do

- [ ] Translate all product names and descriptions
- [ ] Translate admin dashboard
- [ ] Add date/time formatting per locale
- [ ] Add currency formatting per locale
- [ ] Translate email templates
- [ ] Add more locales (Spanish, German, etc.)

## Troubleshooting

### Routes returning 404

- Ensure the route is prefixed with a locale (`/en/...` or `/fr/...`)
- Check if rewrites in `next.config.ts` are working
- Restart the dev server after config changes

### Translations not showing

- Verify the dictionary key exists in both locale files
- Check that the dictionary is being passed to client components
- Ensure you're using the correct translation function

### Language switcher not working

- Check browser console for errors
- Verify the current path is supported
- Ensure `LanguageSwitcher` has access to `next/navigation` hooks

## References

- [Next.js Internationalization Docs](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
