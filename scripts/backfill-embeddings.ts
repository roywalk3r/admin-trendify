/**
 * Backfill product embeddings for semantic search / similar items.
 * Usage: pnpm tsx scripts/backfill-embeddings.ts
 */
import prisma from "@/lib/prisma"

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const BATCH_SIZE = 20

async function embed(text: string) {
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is required")
  const trimmed = text.slice(0, 2000)
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: {
          parts: [{ text: trimmed }],
        },
      }),
    }
  )
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini error: ${res.status} ${err}`)
  }
  const data = (await res.json()) as any
  const values = data?.embedding?.values
  return values && Array.isArray(values) ? (values as number[]) : undefined
}

async function main() {
  // Prisma does not allow filtering on Unsupported types; use raw SQL for embedding IS NULL
  const totalResult = (await prisma.$queryRawUnsafe(
    `SELECT COUNT(*)::int AS count FROM "products" WHERE embedding IS NULL;`
  )) as Array<{ count: number }>
  const total = totalResult?.[0]?.count ?? 0
  console.log(`Embedding backfill starting. Remaining: ${total}`)

  let processed = 0
  while (true) {
    const products = (await prisma.$queryRawUnsafe(
      `SELECT id, name, description FROM "products" WHERE embedding IS NULL LIMIT $1;`,
      BATCH_SIZE
    )) as Array<{ id: string; name: string; description: string | null }>
    if (!products.length) break

    for (const p of products) {
      const text = `${p.name}\n${p.description ?? ""}`
      try {
        const vec = await embed(text)
        if (!vec) {
          console.warn(`No embedding returned for product ${p.id}`)
          continue
        }
        await prisma.product.update({
          where: { id: p.id },
          data: { embedding: vec as any },
        })
        processed++
        if (processed % 10 === 0) console.log(`Embedded ${processed}/${total}`)
      } catch (err: any) {
        console.error(`Failed embedding product ${p.id}:`, err?.message || err)
      }
    }
  }
  console.log("Embedding backfill completed.")
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
