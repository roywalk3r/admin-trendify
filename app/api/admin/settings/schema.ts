import { z } from "zod"


// SEO settings schema
export const seoSchema = z.object({
  siteTitle: z.string().min(1, "Site title is required"),
  siteDescription: z.string().min(1, "Site description is required"),
{{ ... }}
  sendOrderCancellation: z.boolean().default(true),
  adminNotificationEmails: z.string().optional(),
})

// Theme settings schema
export const themeSchema = z.object({
  primaryColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Must be a valid hex color")
    .default("#000000"),
  secondaryColor: z
{{ ... }}
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Must be a valid hex color")
    .default("#3b82f6"),
  logoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  faviconUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  defaultTheme: z.enum(["light", "dark", "system"]).default("system"),
  enableThemeToggle: z.boolean().default(true),
})

// Flash sale settings schema
export const flashSaleSchema = z.object({
  enabled: z.boolean().default(false),
  title: z.string().default("Flash Sale"),
  subtitle: z.string().default("Limited time offers you can't miss"),
  bannerImage: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  endsAt: z.string().optional(), // ISO datetime string
  discountPercent: z.coerce.number().min(0).max(100).default(20),
  productIds: z.array(z.string()).default([]),
})

// Combined settings schema
export const settingsSchema = z.object({
  seo: seoSchema,
  general: generalSchema,
  social: socialSchema,
  email: emailSchema,
  theme: themeSchema,
  // Optional section; not all consumers require full validation
  flashSale: flashSaleSchema.optional(),
})

export type SEOSettings = z.infer<typeof seoSchema>
export type GeneralSettings = z.infer<typeof generalSchema>
export type SocialSettings = z.infer<typeof socialSchema>
export type EmailSettings = z.infer<typeof emailSchema>
export type ThemeSettings = z.infer<typeof themeSchema>
export type FlashSaleSettings = z.infer<typeof flashSaleSchema>
export type Settings = z.infer<typeof settingsSchema>

// Default values for settings
export const defaultSettings: Settings = {
  seo: {
    siteTitle: "My E-commerce Store",
    siteDescription: "Your one-stop shop for quality products",
    defaultOgImage: "",
    twitterHandle: "",
{{ ... }}
    sendOrderConfirmation: true,
    sendShippingConfirmation: true,
    sendOrderCancellation: true,
    adminNotificationEmails: "",
  },
  theme: {
    primaryColor: "#000000",
    secondaryColor: "#ffffff",
    accentColor: "#3b82f6",
    logoUrl: "",
    faviconUrl: "",
    defaultTheme: "system",
    enableThemeToggle: true,
  },
  flashSale: {
    enabled: false,
    title: "Flash Sale",
    subtitle: "Limited time offers you can't miss",
    bannerImage: "",
    endsAt: "",
    discountPercent: 20,
    productIds: [],
  },
}
