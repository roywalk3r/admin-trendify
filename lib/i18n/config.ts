export const locales = ["en", "fr", "es", "zh", "hi", "ar"] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = "en"

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale)
}

export function getLocaleFromPathname(pathname: string): Locale {
  const segments = pathname.split("/").filter(Boolean)
  const firstSegment = segments[0]
  
  if (firstSegment && isValidLocale(firstSegment)) {
    return firstSegment
  }
  
  return defaultLocale
}

export function stripLocaleFromPathname(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean)
  const firstSegment = segments[0]
  
  if (firstSegment && isValidLocale(firstSegment)) {
    return "/" + segments.slice(1).join("/")
  }
  
  return pathname
}

export function addLocaleToPathname(pathname: string, locale: Locale): string {
  const cleanPath = stripLocaleFromPathname(pathname)
  return `/${locale}${cleanPath === "/" ? "" : cleanPath}`
}
