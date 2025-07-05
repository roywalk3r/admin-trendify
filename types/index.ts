export interface Settings {
  general?: {
    siteName?: string
    siteDescription?: string
    logo?: string
    favicon?: string
    heroTitle?: string
    heroSubtitle?: string
  }
  seo?: {
    title?: string
    description?: string
    keywords?: string
    ogImage?: string
    twitterHandle?: string
  }
  contact?: {
    email?: string
    phone?: string
    address?: string
    hours?: string
  }
  social?: {
    facebook?: string
    twitter?: string
    instagram?: string
    linkedin?: string
  }
}
