"use client"

import { useMemo, useRef, useState } from "react"
import { useLocale } from "./use-translations"

type Dict = Record<string, any>

function getByKey(dict: Dict, key: string): string | undefined {
  return key.split(".").reduce<any>((acc, part) => (acc == null ? undefined : acc[part]), dict)
}

export function useAIFallbackTranslations(dictionary: Dict) {
  const locale = useLocale()
  const [overrides, setOverrides] = useState<Record<string, string>>({})
  const inFlight = useRef<Set<string>>(new Set())

  const t = useMemo(() => {
    return (key: string): string => {
      if (overrides[key]) return overrides[key]
      const val = getByKey(dictionary, key)
      return typeof val === "string" ? val : key
    }
  }, [dictionary, overrides])

  const tAsync = async (key: string, opts?: { sourceLang?: string; sourceText?: string }) => {
    const existing = overrides[key]
    if (existing) return existing
    const current = getByKey(dictionary, key)
    if (typeof current === "string") return current
    if (inFlight.current.has(key)) return key
    inFlight.current.add(key)
    try {
      const res = await fetch("/api/i18n/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key,
          targetLang: locale,
          sourceLang: opts?.sourceLang || "en",
          sourceText: opts?.sourceText,
        }),
      })
      if (!res.ok) return key
      const json = await res.json()
      const translated = String(json?.translated || "").trim()
      if (translated) setOverrides((o) => ({ ...o, [key]: translated }))
      return translated || key
    } catch {
      return key
    } finally {
      inFlight.current.delete(key)
    }
  }

  return { t, tAsync, locale }
}
