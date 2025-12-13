import type React from "react"
import type { Metadata } from "next"
import {Bruno_Ace, Poppins} from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"
import Providers from "@/components/providers"
import { CookieConsentBanner } from "@/components/cookie-consent"
import { Analytics } from "@/components/analytics"
import { LocaleProvider } from "@/components/locale-provider"
import * as Sentry from '@sentry/nextjs';

const brunoAce = Bruno_Ace({
    weight: "400",
    style: "normal",
    preload: true,
    variable: "--font-bruno"
})

const poppins = Poppins({
    weight: "400",
    style: "normal",
    preload: true,
    variable: "--font-poppins"
})

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
        <html lang="en" suppressHydrationWarning
              className={`${brunoAce.variable} ${poppins.variable} antialiased`}>
                <body>
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
