import type { Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/dictionaries"
import { I18nProvider } from "@/lib/i18n/I18nProvider"
import AppShell from "@/components/app-shell"
import Providers from "@/components/providers"
import { LocaleProvider } from "@/components/locale-provider"
import { CookieConsentBanner } from "@/components/cookie-consent"
import { Analytics } from "@/components/analytics"
import { Toaster } from "@/components/ui/toaster"
import React from "react"
import type { Metadata } from "next"

// Define the expected type for the resolved params
// This MUST match what Next.js's LayoutProps<"/[locale]"> expects
interface LocaleParams {
  locale: string; // Changed from Locale to string to match Next.js's internal type
}

// Define the props for your layout component
interface LayoutProps {
  children: React.ReactNode;
  params: Promise<LocaleParams>; // params is a Promise
}

export const metadata: Metadata = {
  applicationName: "Trendify",
  icons: {
    apple: "/apple-touch-icon.png",
    icon: [
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const resolvedParams = await params; // Await the promise
  // Cast resolvedParams.locale to Locale because getDictionary expects the union type
  const dict = await getDictionary(resolvedParams.locale as Locale);
  return (
    <I18nProvider dict={dict}>
      <LocaleProvider>
        <Providers>
          <CookieConsentBanner />
          <Analytics />
          <AppShell>{children}</AppShell>
          <Toaster />
        </Providers>
      </LocaleProvider>
    </I18nProvider>
  )
}
