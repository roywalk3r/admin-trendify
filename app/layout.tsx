import type React from "react"
import type { Metadata } from "next"
// Removed Google Fonts to avoid external fetches in restricted networks
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"
import Providers from "@/components/providers"
import { CookieConsentBanner } from "@/components/cookie-consent"
import { Analytics } from "@/components/analytics"
import { LocaleProvider } from "@/components/locale-provider"
import * as Sentry from '@sentry/nextjs';

// Using system font stack via Tailwind's font-sans


// Add or edit your "generateMetadata" to include the Sentry trace data:
export function generateMetadata(): Metadata {
    return {
        title: "Trendify",
        description: "Your one stop shop for all things fashion",
        other: {
            ...Sentry.getTraceData()
        }
    };
}

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode
}>) {
    // Note: lang is set via middleware redirects and rewrites to locale-prefixed paths
    // The actual locale is in the URL path (e.g., /en/... or /fr/...)
    return (
        <html lang="en" suppressHydrationWarning>
        <body className={`font-sans antialiased`}>
        <LocaleProvider>
          <Providers>
            {/* Consent and analytics */}
            <CookieConsentBanner />
            <Analytics />
            {children}
            <Toaster />
          </Providers>
        </LocaleProvider>
        </body>
        </html>
    )
}
