import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { getCache, setCache } from "@/lib/redis"

const CACHE_TTL_SECONDS = 60

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const cacheKey = `cache:products:similar:${id}`

    const cached = await getCache<any>(cacheKey)
    if (cached) {
      return new Response(JSON.stringify(cached), { status: 200 })
    }

    // Get embedding for the source product
    const source = (await prisma.$queryRawUnsafe(
      `SELECT embedding FROM "products" WHERE id = $1 AND embedding IS NOT NULL LIMIT 1;`,
      id
    )) as any[]

    if (!source?.length) {
      return new Response(JSON.stringify({ error: "Product embedding not found" }), {
        status: 404,
      })
    }

    const embedding = source[0].embedding
    const limit = 8

    const similar = (await prisma.$queryRawUnsafe(
      `
      SELECT
        p.id, p.name, p.slug, p.images, p.price, p.stock, p."category_id",
        p.is_active, p.is_deleted, p.status
      FROM "products" p
      WHERE p.embedding IS NOT NULL
        AND p.id <> $1
        AND p.is_deleted = false
        AND p.is_active = true
      ORDER BY p.embedding <=> $2
      LIMIT $3;
      `,
      id,
      embedding,
      limit
    )) as any[]

    const result = { data: similar }
    await setCache(cacheKey, result, CACHE_TTL_SECONDS)
    return new Response(JSON.stringify(result), { status: 200 })
  } catch (error: any) {
    console.error("similar products error", error)
    return new Response(JSON.stringify({ error: error?.message || "internal error" }), {
      status: 500,
    })
  }
}
