import { NextRequest } from "next/server"

/**
 * Generate draft copy for products/categories using Gemini.
 * Requires GEMINI_API_KEY.
 * Body: { name: string; attributes?: string; tone?: "concise" | "friendly" | "luxury"; type?: "product" | "category" }
 */
export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY not configured" }), {
        status: 500,
      })
    }

    const body = await req.json()
    const name = (body?.name as string | undefined)?.trim()
    const attributes = (body?.attributes as string | undefined)?.trim()
    const tone = (body?.tone as string | undefined)?.trim() || "concise"
    const type = (body?.type as string | undefined)?.trim() || "product"

    if (!name) {
      return new Response(JSON.stringify({ error: "name is required" }), { status: 400 })
    }

    const systemPrompt = `
You are an e-commerce copy assistant. Generate concise, high-conversion copy. 
Return JSON with keys: description (2-3 sentences), bullets (array of 4-6 short bullets), altText (<=100 chars).
Tone: ${tone}. Type: ${type}. Name: ${name}. Attributes: ${attributes ?? "N/A"}.
Avoid making up prices or guarantees. Avoid emojis. Keep factual and clear.
`

    const payload = {
      contents: [
        {
          parts: [{ text: systemPrompt }],
        },
      ],
    }

    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
        apiKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    )

    if (!res.ok) {
      const err = await res.text()
      return new Response(JSON.stringify({ error: `Gemini error: ${res.status} ${err}` }), {
        status: 500,
      })
    }

    const data = (await res.json()) as any
    const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) {
      return new Response(JSON.stringify({ error: "No content returned" }), { status: 500 })
    }

    // Attempt to parse JSON block from response; fallback to plain text.
    let parsed: any = null
    try {
      const match = text.match(/{[\s\S]*}/)
      parsed = match ? JSON.parse(match[0]) : JSON.parse(text)
    } catch {
      parsed = { description: text }
    }

    return new Response(JSON.stringify({ data: parsed }), { status: 200 })
  } catch (error: any) {
    console.error("ai copy error", error)
    return new Response(JSON.stringify({ error: error?.message || "internal error" }), {
      status: 500,
    })
  }
}
