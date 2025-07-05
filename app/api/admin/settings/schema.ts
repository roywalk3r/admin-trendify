import { z } from "zod"

// SEO settings schema
export const seoSchema = z.object({
  siteTitle: z.string().min(1, "Site title is required"),
  siteDescription: z.string().min(1, "Site description is required"),
  defaultOgImage: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  twitterHandle: z.string().optional(),
  googleAnalyticsId: z.string().optional(),
  facebookPixelId: z.string().optional(),
  metaKeywords: z.string().optional(),
  robotsTxt: z.string().optional(),
})

// General settings schema
export const generalSchema = z.object({
  storeName: z.string().min(1, "Store name is required"),
  storeEmail: z.string().email("Must be a valid email"),
  storePhone: z.string().optional(),
  storeAddress: z.string().optional(),
  currencyCode: z.string().min(1, "Currency code is required"),
  enableTaxCalculation: z.boolean().default(true),
  taxRate: z.coerce.number().min(0, "Tax rate cannot be negative"),
  enableFreeShipping: z.boolean().default(false),
  freeShippingThreshold: z.coerce.number().min(0, "Threshold cannot be negative"),
  shippingFee: z.coerce.number().min(0, "Shipping fee cannot be negative"),
  orderPrefix: z.string().optional(),
  showOutOfStockProducts: z.boolean().default(true),
  allowBackorders: z.boolean().default(false),
  lowStockThreshold: z.coerce.number().min(0, "Threshold cannot be negative").default(5),
})

// Social media settings schema
export const socialSchema = z.object({
  facebook: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  twitter: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  instagram: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  youtube: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  pinterest: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  linkedin: z.string().url("Must be a valid URL").optional().or(z.literal("")),
})

// Email settings schema
export const emailSchema = z.object({
  fromEmail: z.string().email("Must be a valid email"),
  fromName: z.string().min(1, "From name is required"),
  smtpHost: z.string().optional(),
  smtpPort: z.coerce.number().optional(),
  smtpUser: z.string().optional(),
  smtpPassword: z.string().optional(),
  sendOrderConfirmation: z.boolean().default(true),
  sendShippingConfirmation: z.boolean().default(true),
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
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Must be a valid hex color")
    .default("#ffffff"),
  accentColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Must be a valid hex color")
    .default("#3b82f6"),
  logoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  faviconUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  defaultTheme: z.enum(["light", "dark", "system"]).default("system"),
  enableThemeToggle: z.boolean().default(true),
})

// Combined settings schema
export const settingsSchema = z.object({
  seo: seoSchema,
  general: generalSchema,
  social: socialSchema,
  email: emailSchema,
  theme: themeSchema,
})

export type SEOSettings = z.infer<typeof seoSchema>
export type GeneralSettings = z.infer<typeof generalSchema>
export type SocialSettings = z.infer<typeof socialSchema>
export type EmailSettings = z.infer<typeof emailSchema>
export type ThemeSettings = z.infer<typeof themeSchema>
export type Settings = z.infer<typeof settingsSchema>

// Default values for settings
export const defaultSettings: Settings = {
  seo: {
    siteTitle: "My E-commerce Store",
    siteDescription: "Your one-stop shop for quality products",
    defaultOgImage: "",
    twitterHandle: "",
    googleAnalyticsId: "",
    facebookPixelId: "",
    metaKeywords: "",
    robotsTxt: "User-agent: *\nAllow: /",
  },
  general: {
    storeName: "My E-commerce Store",
    storeEmail: "contact@example.com",
    storePhone: "+1 (555) 123-4567",
    storeAddress: "",
    currencyCode: "USD",
    enableTaxCalculation: true,
    taxRate: 10,
    enableFreeShipping: false,
    freeShippingThreshold: 100,
    shippingFee: 10,
    orderPrefix: "",
    showOutOfStockProducts: true,
    allowBackorders: false,
    lowStockThreshold: 5,
  },
  social: {
    facebook: "",
    twitter: "",
    instagram: "",
    youtube: "",
    pinterest: "",
    linkedin: "",
  },
  email: {
    fromEmail: "noreply@example.com",
    fromName: "My E-commerce Store",
    smtpHost: "",
    smtpPort: 587,
    smtpUser: "",
    smtpPassword: "",
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
}
