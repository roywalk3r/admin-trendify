"use client"

import { usePathname } from "next/navigation"
import { useMemo } from "react"
import { getLocaleFromPathname, type Locale } from "./config"

// Client-side hook to get current locale
export function useLocale(): Locale {
  const pathname = usePathname()
  return useMemo(() => getLocaleFromPathname(pathname || "/"), [pathname])
}

// For client components, you'll need to pass translations as props from server components
// or fetch them client-side. Here's a simple approach:

type Dictionary = Record<string, any>

export function useTranslations(dictionary: Dictionary) {
  const locale = useLocale()
  
  return {
    t: (key: string): string => {
      const keys = key.split(".")
      let value: any = dictionary
      
      for (const k of keys) {
        value = value?.[k]
        if (value === undefined) return key
      }
      
      return typeof value === "string" ? value : key
    },
    locale,
  }
}
