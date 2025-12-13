"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"

export interface AppSettings {
  // General
  storeName: string
  storeEmail: string
  storePhone: string
  storeAddress: string
  currencyCode: string
  currencySymbol: string
  taxRate: number
  enableTaxCalculation: boolean
  orderPrefix: string

  // Inventory / stock behaviour
  allowBackorders: boolean
  showOutOfStockProducts: boolean
  lowStockThreshold: number

  // Shipping
  shippingFee: number
  freeShippingThreshold: number
  enableFreeShipping: boolean

  // Payment
  paymentGatewayFeePercentage: number
  paymentGatewayFixedFee: number

  // Theme
  primaryColor: string
  logoUrl: string
  faviconUrl: string

  // SEO
  siteTitle: string
  siteDescription: string
  metaKeywords: string
  defaultOgImage: string

  // Social
  facebookUrl: string
  twitterUrl: string
  instagramUrl: string
  linkedinUrl: string

  // Email
  fromEmail: string
  fromName: string

  // Features
  enableWishlist: boolean
  enableReviews: boolean
  enableGuestCheckout: boolean
  enableStockAlerts: boolean
}

const defaultSettings: AppSettings = {
  storeName: "Trendify",
  storeEmail: "testpjmail@gmail.com",
  storePhone: "",
  storeAddress: "",
  currencyCode: "GHS",
  currencySymbol: "GH₵",
  taxRate: 0.1,
  enableTaxCalculation: true,
  orderPrefix: "",
  allowBackorders: false,
  showOutOfStockProducts: true,
  lowStockThreshold: 5,
  shippingFee: 10,
  freeShippingThreshold: 100,
  enableFreeShipping: true,
  paymentGatewayFeePercentage: 0.015,
  paymentGatewayFixedFee: 0.3,
  primaryColor: "#7c3aed",
  logoUrl: "/logo.png",
  faviconUrl: "/favicon.ico",
  siteTitle: "Trendify - Your Online Store",
  siteDescription: "Shop the latest trends in fashion, electronics, and more.",
  metaKeywords: "e-commerce, online shopping, fashion, electronics",
  defaultOgImage: "/og-image.png",
  facebookUrl: "",
  twitterUrl: "",
  instagramUrl: "",
  linkedinUrl: "",
  fromEmail: "noreply@testpjmail@gmail.com",
  fromName: "Trendify",
  enableWishlist: true,
  enableReviews: true,
  enableGuestCheckout: true,
  enableStockAlerts: true,
}

const SettingsContext = createContext<AppSettings>(defaultSettings)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchSettings() {
      try {
        // Use public settings endpoint that does not require admin auth
        const response = await fetch("/api/settings", { cache: "no-store" })
        if (response.ok) {
          const json = await response.json()
          const data = json?.data
          if (data) {
            // Helper: derive currency symbol from code when API doesn't supply one
            const currencyCode = data.general?.currencyCode ?? defaultSettings.currencyCode
            const currencySymbolMap: Record<string, string> = {
              USD: "$",
              EUR: "€",
              GBP: "£",
              JPY: "¥",
              CAD: "C$",
              AUD: "A$",
              GHS: "GH₵",
              NGN: "₦",
              INR: "₹",
            }
            const derivedCurrencySymbol = currencySymbolMap[currencyCode] ?? defaultSettings.currencySymbol

            // Map grouped API shape (general/seo/social/email/theme) to flattened AppSettings
            const mapped: AppSettings = {
              // General
              storeName: data.general?.storeName ?? defaultSettings.storeName,
              storeEmail: data.general?.storeEmail ?? defaultSettings.storeEmail,
              storePhone: data.general?.storePhone ?? defaultSettings.storePhone,
              storeAddress: data.general?.storeAddress ?? defaultSettings.storeAddress,
              currencyCode,
              currencySymbol: derivedCurrencySymbol,
              taxRate: typeof data.general?.taxRate === "number" ? data.general.taxRate : defaultSettings.taxRate,
              enableTaxCalculation: data.general?.enableTaxCalculation ?? defaultSettings.enableTaxCalculation,
              orderPrefix: data.general?.orderPrefix ?? defaultSettings.orderPrefix,
              allowBackorders: data.general?.allowBackorders ?? defaultSettings.allowBackorders,
              showOutOfStockProducts: data.general?.showOutOfStockProducts ?? defaultSettings.showOutOfStockProducts,
              lowStockThreshold:
                typeof data.general?.lowStockThreshold === "number"
                  ? data.general.lowStockThreshold
                  : defaultSettings.lowStockThreshold,

              // Shipping
              shippingFee:
                typeof data.general?.shippingFee === "number"
                  ? data.general.shippingFee
                  : defaultSettings.shippingFee,
              freeShippingThreshold:
                typeof data.general?.freeShippingThreshold === "number"
                  ? data.general.freeShippingThreshold
                  : defaultSettings.freeShippingThreshold,
              enableFreeShipping: data.general?.enableFreeShipping ?? defaultSettings.enableFreeShipping,

              // Payment (can be moved to dedicated payment settings later)
              paymentGatewayFeePercentage:
                typeof data.general?.paymentGatewayFeePercentage === "number"
                  ? data.general.paymentGatewayFeePercentage
                  : defaultSettings.paymentGatewayFeePercentage,
              paymentGatewayFixedFee:
                typeof data.general?.paymentGatewayFixedFee === "number"
                  ? data.general.paymentGatewayFixedFee
                  : defaultSettings.paymentGatewayFixedFee,

              // Theme
              primaryColor: data.theme?.primaryColor ?? defaultSettings.primaryColor,
              logoUrl: data.theme?.logoUrl ?? defaultSettings.logoUrl,
              faviconUrl: data.theme?.faviconUrl ?? defaultSettings.faviconUrl,

              // SEO
              siteTitle: data.seo?.siteTitle ?? defaultSettings.siteTitle,
              siteDescription: data.seo?.siteDescription ?? defaultSettings.siteDescription,
              metaKeywords: data.seo?.metaKeywords ?? defaultSettings.metaKeywords,
              defaultOgImage: data.seo?.defaultOgImage ?? defaultSettings.defaultOgImage,

              // Social
              facebookUrl: data.social?.facebook ?? defaultSettings.facebookUrl,
              twitterUrl: data.social?.twitter ?? defaultSettings.twitterUrl,
              instagramUrl: data.social?.instagram ?? defaultSettings.instagramUrl,
              linkedinUrl: data.social?.linkedin ?? defaultSettings.linkedinUrl,

              // Email
              fromEmail: data.email?.fromEmail ?? defaultSettings.fromEmail,
              fromName: data.email?.fromName ?? defaultSettings.fromName,

              // Features (fallback to defaults; can be moved to dedicated section later)
              enableWishlist: data.general?.enableWishlist ?? defaultSettings.enableWishlist,
              enableReviews: data.general?.enableReviews ?? defaultSettings.enableReviews,
              enableGuestCheckout: data.general?.enableGuestCheckout ?? defaultSettings.enableGuestCheckout,
              enableStockAlerts: data.general?.enableStockAlerts ?? defaultSettings.enableStockAlerts,
            }

            setSettings(mapped)
          }
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error)
        // Use defaults on error
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  // Don't render children until settings are loaded to avoid flash of incorrect data
  if (isLoading) {
    return null // or a loading spinner
  }

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}

// Helper hooks for specific settings
export function useGeneralSettings() {
  const settings = useSettings()
  return {
    storeName: settings.storeName,
    storeEmail: settings.storeEmail,
    storePhone: settings.storePhone,
    storeAddress: settings.storeAddress,
    currencyCode: settings.currencyCode,
    taxRate: settings.taxRate,
    enableTaxCalculation: settings.enableTaxCalculation,
    orderPrefix: settings.orderPrefix,
    allowBackorders: settings.allowBackorders,
    showOutOfStockProducts: settings.showOutOfStockProducts,
    lowStockThreshold: settings.lowStockThreshold,
    shippingFee: settings.shippingFee,
    freeShippingThreshold: settings.freeShippingThreshold,
    enableFreeShipping: settings.enableFreeShipping,
  }
}

export function useSocialSettings() {
  const settings = useSettings()
  return {
    facebook: settings.facebookUrl,
    twitter: settings.twitterUrl,
    instagram: settings.instagramUrl,
    linkedin: settings.linkedinUrl,
    pinterest: undefined as string | undefined,
  }
}

export function useCurrency() {
  const settings = useSettings()
  return {
    code: settings.currencyCode,
    symbol: settings.currencySymbol,
    format: (amount: number) => `${settings.currencySymbol}${amount?.toFixed(2)}`,
  }
}

export function useTax() {
  const settings = useSettings()
  return {
    rate: settings.taxRate,
    enabled: settings.enableTaxCalculation,
    calculate: (amount: number) => settings.enableTaxCalculation ? amount * settings.taxRate : 0,
  }
}

export function useShipping() {
  const settings = useSettings()
  return {
    fee: settings.shippingFee,
    freeThreshold: settings.freeShippingThreshold,
    enabled: settings.enableFreeShipping,
    calculate: (cartTotal: number) => {
      if (settings.enableFreeShipping && cartTotal >= settings.freeShippingThreshold) {
        return 0
      }
      return settings.shippingFee
    },
  }
}

export function usePaymentFee() {
  const settings = useSettings()
  return {
    percentage: settings.paymentGatewayFeePercentage,
    fixedFee: settings.paymentGatewayFixedFee,
    calculate: (amount: number) => {
      return amount * settings.paymentGatewayFeePercentage + settings.paymentGatewayFixedFee
    },
  }
}
