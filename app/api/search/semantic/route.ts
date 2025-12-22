import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { setCache, getCache } from "@/lib/redis"

const CACHE_TTL_SECONDS = 60

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const query = (body?.query as string)?.trim()
    const limit = Math.min(Math.max(Number(body?.limit) || 10, 1), 50)

    if (!query) {
      return new Response(JSON.stringify({ error: "query is required" }), { status: 400 })
    }

    const cacheKey = `cache:search:semantic:${query}:${limit}`
    const cached = await getCache<any>(cacheKey)
    if (cached) {
      return new Response(JSON.stringify(cached), { status: 200 })
    }

    const embedding = await embedText(query)
    if (!embedding) {
      return new Response(JSON.stringify({ error: "embedding failed" }), { status: 500 })
    }

    const products = (await prisma.$queryRawUnsafe(
      `
      SELECT
        p.id, p.name, p.slug, p.images, p.price, p.stock, p."category_id",
        p.is_active, p.is_deleted, p.status
      FROM "products" p
      WHERE p.embedding IS NOT NULL
        AND p.is_deleted = false
        AND p.is_active = true
      ORDER BY p.embedding <=> $1
      LIMIT $2;
      `,
      embedding,
      limit
    )) as any[]

    const result = { data: products }
    await setCache(cacheKey, result, CACHE_TTL_SECONDS)
    return new Response(JSON.stringify(result), { status: 200 })
  } catch (error: any) {
    console.error("semantic search error", error)
    return new Response(JSON.stringify({ error: error?.message || "internal error" }), {
      status: 500,
    })
  }
}

async function embedText(text: string) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null
  const trimmed = text.slice(0, 2000)

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: {
          parts: [{ text: trimmed }],
        },
      }),
    }
  )

  if (!res.ok) return null
  const data = (await res.json()) as any
  const values = data?.embedding?.values
  return values && Array.isArray(values) ? values : null
}
