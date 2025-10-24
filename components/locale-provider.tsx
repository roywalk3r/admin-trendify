"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { getLocaleFromPathname } from "@/lib/i18n/config"

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    const locale = getLocaleFromPathname(pathname || "/")
    document.documentElement.lang = locale
    // Set text direction: Arabic is RTL, others default to LTR
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr"
  }, [pathname])

  return <>{children}</>
}
