"use client"

import { usePathname, useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { locales, getLocaleFromPathname, stripLocaleFromPathname, addLocaleToPathname, type Locale } from "@/lib/i18n/config"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

// We preseed the entire dictionary via API before switching locales

export default function LanguageSwitcher() {
  const pathname = usePathname() || "/"
  const router = useRouter()
  const [loading, setLoading] = useState<Locale | null>(null)
  const [open, setOpen] = useState(false)

  const currentLocale = useMemo<Locale>(() => {
    return getLocaleFromPathname(pathname)
  }, [pathname])

  // Debug: ensure we really have all locales on the client (dev only)
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.debug("LanguageSwitcher locales:", locales)
  }

  const switchLocale = async (newLocale: Locale) => {
    if (newLocale === currentLocale) return
    
    setLoading(newLocale)
    setOpen(false)
    
    // Navigate immediately - don't wait for preseed
    const pathWithoutLocale = stripLocaleFromPathname(pathname)
    const newPath = addLocaleToPathname(pathWithoutLocale, newLocale)
    router.push(newPath)
    router.refresh()
    
    // Fire-and-forget: trigger translation preseeding in background
    // This will populate the cache for subsequent visits
    if (newLocale !== "en") {
      fetch("/api/i18n/preseed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetLang: newLocale, sourceLang: "en" }),
      }).catch(() => {
        // Silently fail - translations will be generated on-demand instead
        console.debug(`Background preseed for ${newLocale} failed, will use on-demand translation`)
      }).finally(() => {
        setLoading(null)
      })
    } else {
      setLoading(null)
    }
  }

  // Use imported locales, but if something strips them client-side, fallback to a hardcoded list
  const allLocales: Locale[] = (Array.isArray(locales) && locales.length > 1
    ? locales
    : (['en','fr','es','zh','hi','ar'] as Locale[]))

  // Fallback rendering if only one locale is available
  if (!allLocales || allLocales.length <= 1) {
    return (
      <Button variant="outline" size="sm" disabled>
        {currentLocale?.toUpperCase() || "EN"}
      </Button>
    )
  }

  return (
    <div className="relative z-50">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild aria-haspopup="menu" aria-expanded={open}>
          <Button variant="outline" size="sm" aria-label="Change language" type="button">
            Language: {currentLocale?.toUpperCase() || "EN"} {loading ? "…" : ""}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={6} className="z-[9999] bg-background text-foreground" forceMount>
          <DropdownMenuLabel className="text-foreground">Choose language</DropdownMenuLabel>
          {allLocales.map((loc) => (
            <DropdownMenuItem key={loc} onClick={() => switchLocale(loc)} disabled={loading === loc} className="text-foreground">
              <span className="mr-2 inline-block w-8 text-muted-foreground">{loc.toUpperCase()}</span>
              {loc === currentLocale ? <span className="text-primary">Current</span> : <span>Switch</span>}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
