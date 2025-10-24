"use client"

import React, { createContext, useContext, useMemo } from "react"

type Dictionary = Record<string, any>

type Ctx = {
  dict: Dictionary
  t: (key: string) => string
}

const I18nContext = createContext<Ctx | null>(null)

export function I18nProvider({ dict, children }: { dict: Dictionary; children: React.ReactNode }) {
  const value = useMemo<Ctx>(() => ({
    dict,
    t: (key: string) => {
      const parts = key.split(".")
      let current: any = dict
      for (const p of parts) {
        current = current?.[p]
        if (current == null) return key
      }
      return typeof current === "string" ? current : key
    },
  }), [dict])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error("useI18n must be used within I18nProvider")
  return ctx
}
