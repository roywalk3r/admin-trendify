import type { NextRequest } from "next/server"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { GoogleGenAI } from "@google/genai"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const q = (body?.q || "").trim()
    if (!q) return createApiResponse({ data: { suggestions: [] } })

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return createApiResponse({ data: { suggestions: [] }, status: 200 })

    const ai = new GoogleGenAI({ apiKey })
    const prompt = `User search query: "${q}"\nReturn 6 short alternative queries or expansions (synonyms, common brand/model names, category terms).\nReturn as a JSON array of strings only.`

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    })
    // Ensure text is a string to satisfy TS
    let text = (result.text ?? "") as string

    // Normalize common wrapping like code fences and labels
    const normalize = (s: string) =>
      s
        .replace(/^```(?:json)?/i, "")
        .replace(/```$/i, "")
        .replace(/```/g, "")
        .replace(/^\s*json\s*/i, "")
        .replace(/[“”]/g, '"')
        .trim()

    text = normalize(text)

    let suggestions: string[] = []
    try {
      suggestions = JSON.parse(text)
      if (!Array.isArray(suggestions)) suggestions = []
    } catch {
      // Try to extract quoted strings
      const quoted: string[] = []
      const re = /"([^"\r\n]+)"/g
      let m: RegExpExecArray | null
      while ((m = re.exec(text))) quoted.push(m[1])
      if (quoted.length > 0) {
        suggestions = quoted.slice(0, 6)
      } else {
        // fallback: split by newline or comma
        suggestions = text
          .replace(/[\[\]]/g, "")
          .split(/\n|,/) 
          .map((s) => s.trim().replace(/^"|"$/g, ""))
          .filter(Boolean)
          .slice(0, 6)
      }
    }

    return createApiResponse({ data: { suggestions } })
  } catch (error) {
    return handleApiError(error)
  }
}
