import type { AIResponse } from "@/lib/ai/gemini-service"

// Lightweight Google Translate REST client using API key
// Set GOOGLE_TRANSLATE_API_KEY in your environment.

const API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY

export async function googleTranslate(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<AIResponse> {
  try {
    if (!API_KEY) {
      return { success: false, error: "GOOGLE_TRANSLATE_API_KEY not configured" }
    }

    // Google Translate v2 endpoint
    const url = "https://translation.googleapis.com/language/translate/v2?key=" + encodeURIComponent(API_KEY)

    const body = {
      q: text,
      source: sourceLang,
      target: targetLang,
      format: "text",
    }

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      // Attempt to parse error JSON from Google API
      let code: number | string | undefined
      let status: string | undefined
      let message = `Google Translate error: HTTP ${res.status}`
      try {
        const err = await res.json()
        code = err?.error?.code
        status = err?.error?.status || err?.error?.errors?.[0]?.reason
        message = err?.error?.message || message
      } catch {}
      return { success: false, error: message, code, status }
    }

    const data = await res.json()
    const translated = data?.data?.translations?.[0]?.translatedText
    if (!translated) {
      return { success: false, error: "No translation returned from Google Translate" }
    }

    // Match AIResponse shape used elsewhere
    return { success: true, data: translated, model: "google-translate-v2" }
  } catch (error: any) {
    return { success: false, error: error?.message || "Google Translate request failed" }
  }
}
