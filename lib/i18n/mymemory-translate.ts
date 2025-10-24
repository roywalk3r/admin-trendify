import type { AIResponse } from "@/lib/ai/gemini-service"

// MyMemory Free Translation API
// Docs: https://mymemory.translated.net/doc/spec.php
// No API key required for basic usage, community-backed with limits.

export async function myMemoryTranslate(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<AIResponse> {
  try {
    const params = new URLSearchParams()
    params.set("q", text)
    params.set("langpair", `${sourceLang}|${targetLang}`)

    // Optional email improves quota according to MyMemory docs
    const email = process.env.MYMEMORY_EMAIL
    if (email) params.set("de", email)

    const url = `https://api.mymemory.translated.net/get?${params.toString()}`
    const res = await fetch(url, { method: "GET" })

    if (!res.ok) {
      return { success: false, error: `MyMemory error: HTTP ${res.status}` }
    }

    const data = await res.json()
    const translated = data?.responseData?.translatedText
    const match = data?.responseData?.match

    if (!translated) {
      const message = data?.responseDetails || "No translation returned from MyMemory"
      return { success: false, error: message }
    }

    // success, include metadata
    return {
      success: true,
      data: translated,
      model: "mymemory-free",
      status: typeof match === "number" ? `match:${match}` : undefined,
    }
  } catch (error: any) {
    return { success: false, error: error?.message || "MyMemory request failed" }
  }
}
