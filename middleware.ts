import { clerkMiddleware } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import arcjet, { createMiddleware, detectBot } from "@arcjet/next"
import { locales, defaultLocale, isValidLocale, getLocaleFromPathname, stripLocaleFromPathname } from "@/lib/i18n/config"

// Initialize Arcjet
const aj = arcjet({
  key: process.env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  rules: [
    detectBot({
      mode: "DRY_RUN", // will block requests. Use "DRY_RUN" to log only
      // Block all bots except the following
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
        // Uncomment to allow these other common bot categories
        // See the full list at https://arcjet.com/bot-list
        "CATEGORY:MONITOR", // Uptime monitoring services
        "CATEGORY:PREVIEW", // Link previews e.g. Slack, Discord
      ],
    }),
  ],
})

function isProtectedPath(pathname: string): boolean {
  const pathNoLocale = stripLocaleFromPathname(pathname)
  return pathNoLocale.startsWith("/admin") || pathNoLocale.startsWith("/api/admin")
}

// Combine Clerk and Arcjet middleware
const combinedMiddleware = createMiddleware(aj, async (req) => {
  const pathname = req.nextUrl.pathname

  // Redirect root to default locale
  if (pathname === "/") {
    const url = req.nextUrl.clone()
    url.pathname = `/${defaultLocale}`
    return NextResponse.redirect(url)
  }

  // Run Clerk middleware with admin protection
  // @ts-ignore
  return clerkMiddleware(async (auth, req) => {
    if (isProtectedPath(pathname)) {
      await auth.protect()
    }
  })(req)
})

export default combinedMiddleware

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
