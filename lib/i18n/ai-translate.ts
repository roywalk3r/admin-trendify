import { promises as fs } from "fs"
import path from "path"
import { geminiService } from "@/lib/ai/gemini-service"
import type { AIResponse } from "@/lib/ai/gemini-service"
import { googleTranslate } from "@/lib/i18n/google-translate"
import { myMemoryTranslate } from "@/lib/i18n/mymemory-translate"
import { libreTranslate } from "@/lib/i18n/libre-translate"
import prisma from "@/lib/prisma"

export type TranslateParams = {
  key: string
  sourceText: string
  sourceLang: string
  targetLang: string
}

const memoryCache = new Map<string, string>()

function cacheKey({ key, targetLang }: { key: string; targetLang: string }) {
  return `${targetLang}::${key}`
}

function getCacheFilePath(locale: string) {
  // Persist under repo so it survives dev restarts
  return path.join(process.cwd(), "lib", "i18n", "cache", `${locale}.json`)
}

async function ensureDirExists(dirPath: string) {
  try {
    await fs.mkdir(dirPath, { recursive: true })
  } catch {}
}

async function readLocaleCacheFile(locale: string): Promise<Record<string, string>> {
  const file = getCacheFilePath(locale)
  try {
    const txt = await fs.readFile(file, "utf8")
    return JSON.parse(txt)
  } catch {
    return {}
  }
}

async function writeLocaleCacheFile(locale: string, data: Record<string, string>) {
  const file = getCacheFilePath(locale)
  await ensureDirExists(path.dirname(file))
  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf8")
}

function buildPrompt({ sourceText, sourceLang, targetLang }: Omit<TranslateParams, "key">) {
  return `Translate the following UI string from ${sourceLang} to ${targetLang}.
Rules:
- Output ONLY the translation, no quotes, no extra text.
- Preserve placeholders exactly (e.g., {name}, %s, {{count}}), HTML tags, and punctuation.
- Keep tone concise for UI.

Text:
${sourceText}`
}

export async function translateMissing(params: TranslateParams): Promise<{ translated: string }> {
  const { key, sourceText, sourceLang, targetLang } = params

  // memory cache first
  const mKey = cacheKey({ key, targetLang })
  const mem = memoryCache.get(mKey)
  if (mem) return { translated: mem }

  // prisma cache next
  try {
    const row = await prisma.translationCache.findUnique({ where: { locale_key: { locale: targetLang, key } } as any })
    if (row?.value) {
      memoryCache.set(mKey, row.value)
      return { translated: row.value }
    }
  } catch {}

  // file cache fallback
  const fileCache = await readLocaleCacheFile(targetLang)
  if (fileCache[key]) {
    memoryCache.set(mKey, fileCache[key])
    return { translated: fileCache[key] }
  }

  // call translation providers in priority order (free-first):
  // 1) MyMemory (free)
  // 2) LibreTranslate (self-hosted/public instance)
  // 3) Google Translate (paid)
  // 4) Gemini (LLM fallback)
  let ai: AIResponse | undefined

  const disableMyMemory = String(process.env.I18N_DISABLE_MYMEMORY || "").toLowerCase() === "true"

  if (!disableMyMemory) {
    const r = await myMemoryTranslate(sourceText, sourceLang, targetLang)
    if (r.success) ai = r
  }

  if (!ai || !ai.success) {
    const hasLibre = !!process.env.LIBRETRANSLATE_URL
    if (hasLibre) {
      const r = await libreTranslate(sourceText, sourceLang, targetLang)
      if (r.success) ai = r
    }
  }

  if (!ai || !ai.success) {
    const useGoogle = !!process.env.GOOGLE_TRANSLATE_API_KEY && process.env.I18N_PROVIDER !== "gemini"
    if (useGoogle) {
      const r = await googleTranslate(sourceText, sourceLang, targetLang)
      if (r.success) ai = r
    }
  }

  if (!ai || !ai.success) {
    const prompt = buildPrompt({ sourceText, sourceLang, targetLang })
    ai = await geminiService.generateText(prompt)
  }
  if (!ai.success) {
    const errorMsg = ai.error || "AI translation failed"
    console.error(`[i18n] Translation failed for key "${key}" (${targetLang}):`, errorMsg)
    // Throw an Error but attach structured fields so callers can handle rate limits
    const err = new Error(errorMsg) as any
    if (ai.code !== undefined) err.code = ai.code
    if (ai.status) err.status = ai.status
    if (ai.retryAfterMs) err.retryAfterMs = ai.retryAfterMs
    throw err
  }

  // Gemini wrapper returns string at data
  let translated = String(ai.data || "").trim()
  // Guard against accidental quotes or code blocks
  translated = translated.replace(/^"|"$/g, "").replace(/^`{3}[a-zA-Z]*\n?|`{3}$/g, "").trim()
  if (!translated) {
    console.error(`[i18n] Empty translation returned for key "${key}" (${targetLang})`)
    throw new Error("Empty translation from AI")
  }
  
  console.debug(`[i18n] ✓ Translated "${key}" to ${targetLang}: "${translated.substring(0, 50)}...")`)

  // persist to prisma
  try {
    await prisma.translationCache.upsert({
      where: { locale_key: { locale: targetLang, key } } as any,
      update: { value: translated },
      create: { locale: targetLang, key, value: translated },
    })
  } catch {}

  // also persist to file (best-effort)
  try {
    const latestFileCache = await readLocaleCacheFile(targetLang)
    const updated = { ...latestFileCache, [key]: translated }
    await writeLocaleCacheFile(targetLang, updated)
  } catch {}
  memoryCache.set(mKey, translated)

  return { translated }
}
