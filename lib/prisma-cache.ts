export type PrismaAccelerateCacheStrategy = {
  ttl: number
  swr?: number
}

export const prismaCache = {
  // For frequently changing lists (e.g. search, trending)
  short(): PrismaAccelerateCacheStrategy {
    return { ttl: 30, swr: 30 }
  },

  // For most public catalog reads
  medium(): PrismaAccelerateCacheStrategy {
    return { ttl: 120, swr: 120 }
  },

  // For infrequently changing reads (settings, categories)
  long(): PrismaAccelerateCacheStrategy {
    return { ttl: 300, swr: 300 }
  },
} as const
