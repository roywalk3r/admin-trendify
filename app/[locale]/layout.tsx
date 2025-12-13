import { locales, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/dictionaries"
import { I18nProvider } from "@/lib/i18n/I18nProvider"
import AppShell from "@/components/app-shell"
import React from "react"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

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

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const resolvedParams = await params; // Await the promise
  // Cast resolvedParams.locale to Locale because getDictionary expects the union type
  const dict = await getDictionary(resolvedParams.locale as Locale);
  return (
    <I18nProvider dict={dict}>
      <AppShell>{children}</AppShell>
    </I18nProvider>
  )
}
