import type { AIResponse } from "@/lib/ai/gemini-service"

// LibreTranslate client
// Self-hosted URL recommended (e.g., http://localhost:5000). Public instances may rate-limit.
// Env vars:
// - LIBRETRANSLATE_URL (required to enable)
// - LIBRETRANSLATE_API_KEY (optional, depending on server config)

const BASE_URL = process.env.LIBRETRANSLATE_URL
const API_KEY = process.env.LIBRETRANSLATE_API_KEY

export async function libreTranslate(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<AIResponse> {
  try {
    if (!BASE_URL) {
      return { success: false, error: "LIBRETRANSLATE_URL not configured" }
    }

    const url = new URL("/translate", BASE_URL).toString()

    const body: Record<string, any> = {
      q: text,
      source: sourceLang,
      target: targetLang,
      format: "text",
    }
    if (API_KEY) body.api_key = API_KEY

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      let message = `LibreTranslate error: HTTP ${res.status}`
      try {
        const err = await res.json()
        message = err?.error || err?.message || message
      } catch {}
      return { success: false, error: message }
    }

    const data = await res.json()
    const translated = data?.translatedText
    if (!translated) {
      return { success: false, error: "No translation returned from LibreTranslate" }
    }

    return { success: true, data: translated, model: "libretranslate" }
  } catch (error: any) {
    return { success: false, error: error?.message || "LibreTranslate request failed" }
  }
}
