import { NextRequest, NextResponse } from "next/server"
import { translateMissing } from "@/lib/i18n/ai-translate"
import { getDictionary } from "@/lib/i18n/dictionaries"
import { defaultLocale, isValidLocale } from "@/lib/i18n/config"

export const runtime = "nodejs"

function getByKey(obj: any, key: string): string | undefined {
  return key.split(".").reduce<any>((acc, part) => (acc == null ? undefined : acc[part]), obj)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const key = String(body.key || "").trim()
    const sourceTextInput = typeof body.sourceText === "string" ? body.sourceText : undefined
    const sourceLang = String(body.sourceLang || defaultLocale)
    const targetLang = String(body.targetLang || "").trim()

    if (!key) {
      return NextResponse.json({ error: "Missing 'key'" }, { status: 400 })
    }
    if (!targetLang || !isValidLocale(targetLang)) {
      return NextResponse.json({ error: "Invalid 'targetLang'" }, { status: 400 })
    }

    // Resolve source text
    let sourceText = sourceTextInput
    if (!sourceText) {
      const dict = await getDictionary((isValidLocale(sourceLang) ? sourceLang : defaultLocale) as any)
      sourceText = getByKey(dict, key)
    }
    if (!sourceText) {
      return NextResponse.json({ error: "Source text not found for key" }, { status: 404 })
    }

    const { translated } = await translateMissing({ key, sourceText, sourceLang, targetLang })
    return NextResponse.json({ key, translated })
  } catch (e: any) {
    const msg = e?.message || "Internal error"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
