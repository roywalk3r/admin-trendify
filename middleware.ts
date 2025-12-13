import { clerkMiddleware } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { defaultLocale, isValidLocale, stripLocaleFromPathname } from "@/lib/i18n/config"
import { withRateLimit } from "@/lib/rate-limit"

function isWebhookPath(pathname: string): boolean {
  return pathname.startsWith("/api/webhooks/")
}

function isProtectedPath(pathname: string): boolean {
  const noLocale = stripLocaleFromPathname(pathname)
  return noLocale.startsWith("/admin") || noLocale.startsWith("/api/admin")
}

// Rate limiting configurations for different API endpoints
const rateLimitConfigs = {
  '/api/cart': { limit: 30, windowSeconds: 60 },
  '/api/checkout': { limit: 10, windowSeconds: 60 },
  '/api/payments': { limit: 5, windowSeconds: 60 },
  '/api/search': { limit: 100, windowSeconds: 60 },
  '/api/products': { limit: 200, windowSeconds: 60 },
  '/api/admin': { limit: 50, windowSeconds: 60 },
  '/api/newsletter': { limit: 3, windowSeconds: 300 }, // 3 subscriptions per 5 minutes
  '/api/contact': { limit: 5, windowSeconds: 300 }, // 5 contact messages per 5 minutes
  'default': { limit: 100, windowSeconds: 60 }
}

function getRateLimitConfig(pathname: string) {
  // Check for exact matches first
  if (rateLimitConfigs[pathname as keyof typeof rateLimitConfigs]) {
    return rateLimitConfigs[pathname as keyof typeof rateLimitConfigs]
  }
  
  // Check for prefix matches
  for (const [key, config] of Object.entries(rateLimitConfigs)) {
    if (key !== 'default' && pathname.startsWith(key)) {
      return config
    }
  }
  
  return rateLimitConfigs.default
}

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl

  // Normalize dev host so browser origin matches Appwrite CORS (allows localhost only)
  if (req.nextUrl.hostname === "127.0.0.1" || req.nextUrl.hostname === "::1") {
    const url = req.nextUrl.clone()
    url.hostname = "localhost"
    return NextResponse.redirect(url)
  }

  // 0) Bypass webhooks completely to preserve raw body for signature verification
  if (isWebhookPath(pathname)) {
    return NextResponse.next()
  }

  // 1) Locale handling: prefix default locale if missing for non-API routes
  if (pathname === "/") {
    const url = req.nextUrl.clone()
    url.pathname = `/${defaultLocale}`
    return NextResponse.redirect(url)
  }

  const segments = pathname.split("/").filter(Boolean)
  const hasLocale = segments[0] && isValidLocale(segments[0]!)
  const isApi = pathname.startsWith("/api") || pathname.startsWith("/trpc")

  if (!hasLocale && !isApi) {
    const url = req.nextUrl.clone()
    url.pathname = `/${defaultLocale}${pathname}`
    return NextResponse.redirect(url)
  }

  // 2) Clerk protection for protected paths
  if (isProtectedPath(req.nextUrl.pathname)) {
    await auth.protect()
  }

  return NextResponse.next()
})

export const config = {
    matcher: [
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
    ],
}
