import prisma from "@/lib/prisma"

// Prisma Accelerate cache tags must be alphanumeric/underscore, <=64 chars, max 5 per query
export function normalizeCacheTags(tags: string[]) {
  return tags
    .map((tag) => tag.replace(/[^A-Za-z0-9_]/g, "_").slice(0, 64))
    .filter(Boolean)
    .slice(0, 5)
}

// Avoid spamming logs if Accelerate is on hold (e.g., plan limit reached)
let accelerateOnHold = false

export async function invalidateCacheTags(tags: string[]) {
  const accelerator = (prisma as any)?.$accelerate
  if (!accelerator?.invalidate) return

  if (accelerateOnHold) return

  const safeTags = normalizeCacheTags(tags)

  try {
    await accelerator.invalidate({ tags: safeTags })
  } catch (error: any) {
    const message = error?.message || ""
    const isHold = message.includes("planLimitReached") || message.includes("P6003")
    if (isHold) {
      accelerateOnHold = true
      console.warn("Accelerate is on hold (plan limit reached); skipping further invalidations this run.")
      return
    }
    console.error("Accelerate invalidate error", { tags: safeTags, error })
  }
}
