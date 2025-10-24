import type { Locale } from "./config"
import { promises as fs } from "fs"
import path from "path"
import { translateMissing } from "@/lib/i18n/ai-translate"
import prisma from "@/lib/prisma"

const dictionaries = {
  en: () => import("./dictionaries/en.json").then((module) => module.default),
  fr: () => import("./dictionaries/fr.json").then((module) => module.default),
  es: () => import("./dictionaries/es.json").then((module) => module.default),
  zh: () => import("./dictionaries/zh.json").then((module) => module.default),
  hi: () => import("./dictionaries/hi.json").then((module) => module.default),
  ar: () => import("./dictionaries/ar.json").then((module) => module.default),
}

function deepMerge<T extends Record<string, any>>(base: T, overlay: Partial<T>): T {
  const out: any = Array.isArray(base) ? [...(base as any)] : { ...base }
  for (const [k, v] of Object.entries(overlay || {})) {
    const bv = (out as any)[k]
    if (
      v && typeof v === "object" && !Array.isArray(v) &&
      bv && typeof bv === "object" && !Array.isArray(bv)
    ) {
      ;(out as any)[k] = deepMerge(bv, v as any)
    } else if (v !== undefined) {
      ;(out as any)[k] = v
    }
  }
  return out
}

async function readCache(locale: string): Promise<Record<string, any>> {
  // Try Prisma first
  try {
    const rows = await prisma.translationCache.findMany({ where: { locale } })
    if (rows?.length) {
      const nested: Record<string, any> = {}
      for (const r of rows) {
        const parts = r.key.split(".")
        let cursor: any = nested
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i]
          if (i === parts.length - 1) cursor[p] = r.value
          else {
            cursor[p] = cursor[p] && typeof cursor[p] === "object" ? cursor[p] : {}
            cursor = cursor[p]
          }
        }
      }
      return nested
    }
  } catch {}
  // Fallback to file cache
  try {
    const file = path.join(process.cwd(), "lib", "i18n", "cache", `${locale}.json`)
    const txt = await fs.readFile(file, "utf8")
    const flat: Record<string, string> = JSON.parse(txt)
    const nested: Record<string, any> = {}
    for (const [k, v] of Object.entries(flat)) {
      const parts = k.split(".")
      let cursor: any = nested
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i]
        if (i === parts.length - 1) cursor[p] = v
        else {
          cursor[p] = cursor[p] && typeof cursor[p] === "object" ? cursor[p] : {}
          cursor = cursor[p]
        }
      }
    }
    return nested
  } catch {
    return {}
  }
}

export const getDictionary = async (locale: Locale) => {
  const load = dictionaries[locale] ?? dictionaries.en
  const base = await load()
  
  // Always load English as fallback for missing keys
  const enBase = locale !== "en" ? await dictionaries.en() : base
  
  // Merge AI cache overlay if present
  const overlay = await readCache(locale)
  if (overlay && Object.keys(overlay).length > 0) {
    // Merge order: English base -> locale base -> AI cache
    const merged = deepMerge(base, overlay)
    return locale !== "en" ? deepMerge(enBase, merged) : merged
  }

  // Return with English fallback for missing keys
  return locale !== "en" ? deepMerge(enBase, base) : base
}
