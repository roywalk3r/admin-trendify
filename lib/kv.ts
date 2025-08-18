const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || ""
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || ""

if (!KV_URL || !KV_TOKEN) {
  // We don't throw at import time to not crash local preview; API handlers can validate.
  console.warn("KV configuration missing. Set KV_REST_API_URL and KV_REST_API_TOKEN (or UPSTASH_REDIS_REST_URL/TOKEN).")
}

type PipelineCommand = (string | number | boolean | null)[]

async function pipeline<T = unknown>(commands: PipelineCommand[]): Promise<T[]> {
  const res = await fetch(`${KV_URL}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
    cache: "no-store",
  })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`KV pipeline error: ${res.status} ${res.statusText} ${text}`)
  }
  const data = (await res.json()) as { result: unknown }[]
  return data.map((d) => (d as any).result) as T[]
}

export async function kvGetJSON<T>(key: string): Promise<T | null> {
  const [val] = await pipeline<[string | null]>([["GET", key]])
  if (val == null) return null
  try {
    return JSON.parse(val as unknown as string) as T
  } catch {
    return null
  }
}

export async function kvSetJSON(key: string, value: unknown): Promise<"OK"> {
  const str = JSON.stringify(value)
  const [ok] = await pipeline<string>([["SET", key, str]])
  return ok as "OK"
}

export async function kvDel(key: string): Promise<number> {
  const [deleted] = await pipeline<number>([["DEL", key]])
  return deleted ?? 0
}
