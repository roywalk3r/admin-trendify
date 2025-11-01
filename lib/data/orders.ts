import prisma from "@/lib/prisma"
import { getCache, setCache, deleteCache } from "@/lib/redis"

const TTL_SECONDS = 120 // 2 minutes

const orderCacheKey = (id: string) => `cache:orders:${id}`

export async function getOrderByIdCached(id: string) {
  const key = orderCacheKey(id)
  const cached = await getCache<any>(key)
  if (cached) return cached

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      orderItems: { include: { product: { select: { id: true, name: true, price: true } } } },
      shippingAddress: true,
      driver: true,
    },
  })

  if (order) {
    await setCache(key, order, TTL_SECONDS)
  }
  return order
}

export async function invalidateOrderCache(id: string) {
  await deleteCache(orderCacheKey(id))
}
