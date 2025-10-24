import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import { Inter, Bruno_Ace } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"
import Providers from "@/components/providers"
import { CookieConsentBanner } from "@/components/cookie-consent"
import { Analytics } from "@/components/analytics"
import { LocaleProvider } from "@/components/locale-provider"
import * as Sentry from '@sentry/nextjs';

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
})

const bruno = Bruno_Ace({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-bruno-ace",
    display: "swap",
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
        <html lang="en" suppressHydrationWarning>
        <body className={`${poppins.className}   ${inter.variable} ${bruno.variable} antialiased`}>
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
