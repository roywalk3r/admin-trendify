import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'

declare global {
  var __globalPrisma__: PrismaClient | undefined
}

export const prisma =
  globalThis.__globalPrisma__ ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  }).$extends(withAccelerate())

if (process.env.NODE_ENV !== "production") {
  globalThis.__globalPrisma__ = prisma
}

export default prisma

