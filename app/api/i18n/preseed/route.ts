import { NextRequest, NextResponse } from "next/server"
import { getDictionary } from "@/lib/i18n/dictionaries"
import { defaultLocale, isValidLocale } from "@/lib/i18n/config"
import { translateMissing } from "@/lib/i18n/ai-translate"

export const runtime = "nodejs"
export const maxDuration = 300

function flattenDict(obj: any, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(obj || {})) {
    const key = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === "object") {
      Object.assign(out, flattenDict(v, key))
    } else if (typeof v === "string") {
      out[key] = v
    }
  }
  return out
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const targetLang = String(body.targetLang || "").trim()
    const sourceLang = String(body.sourceLang || defaultLocale)
    const keys: string[] | undefined = Array.isArray(body.keys) ? body.keys : undefined

    if (!targetLang || !isValidLocale(targetLang)) {
      return NextResponse.json({ error: "Invalid 'targetLang'" }, { status: 400 })
    }

    // Don't re-translate English
    if (targetLang === "en") {
      return NextResponse.json({ success: true, count: 0, targetLang, message: "English is the source language" })
    }

    const sourceDict = await getDictionary((isValidLocale(sourceLang) ? sourceLang : defaultLocale) as any)
    const flat = flattenDict(sourceDict)

    const workKeys = keys && keys.length ? keys.filter((k) => flat[k]) : Object.keys(flat)

    console.log(`[i18n] Preseeding ${workKeys.length} keys for locale: ${targetLang}`)

    // Concurrency kept very low to avoid Gemini free-tier rate limits
    const concurrency = Number(process.env.I18N_CONCURRENCY || 1)
    const queue = [...workKeys]
    let successCount = 0
    let failCount = 0
    let processed = 0

    const MAX_RETRIES = Number(process.env.I18N_RETRY_MAX || 3)
    const BATCH_SIZE = Number(process.env.I18N_BATCH_SIZE || 20)
    const PAUSE_MS = Number(process.env.I18N_BATCH_PAUSE_MS || 1000)

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

    async function translateWithRetry(key: string, sourceText: string) {
      let attempt = 0
      let delay = 300
      while (attempt < MAX_RETRIES) {
        try {
          await translateMissing({ key, sourceText, sourceLang, targetLang })
          return true
        } catch (err: any) {
          attempt++
          if (attempt >= MAX_RETRIES) {
            console.debug(`[i18n] Giving up on key "${key}" after ${attempt} attempts:`, err?.message || err)
            return false
          }
          // Honor Retry-After when provided by provider
          const retryAfterMs = typeof err?.retryAfterMs === 'number' ? err.retryAfterMs : undefined
          if (retryAfterMs && retryAfterMs > 0) {
            await sleep(retryAfterMs)
          } else {
            // Exponential backoff with jitter
            const jitter = Math.floor(Math.random() * 150)
            await sleep(delay + jitter)
            delay *= 2
          }
        }
      }
      return false
    }

    const workers: Promise<void>[] = []
    for (let i = 0; i < concurrency; i++) {
      workers.push(
        (async () => {
          while (queue.length) {
            const k = queue.shift()!
            const sourceText = flat[k]
            const ok = await translateWithRetry(k, sourceText)
            if (ok) successCount++
            else failCount++
            processed++
            if (processed % BATCH_SIZE === 0) {
              await sleep(PAUSE_MS)
            }
          }
        })()
      )
    }

    await Promise.all(workers)

    console.log(`[i18n] Preseed complete for ${targetLang}: ${successCount} success, ${failCount} failed`)

    return NextResponse.json({ 
      success: true, 
      count: workKeys.length, 
      targetLang,
      successCount,
      failCount
    })
  } catch (e: any) {
    console.error("[i18n] Preseed error:", e)
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 })
  }
}
