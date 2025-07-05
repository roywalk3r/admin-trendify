import { auth } from "@clerk/nextjs/server"

import { prisma } from "@/lib/prisma"

export async function getCurrentUser() {
  const { userId } = auth()

  if (!userId) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: {
      clerkId: userId,
    },
  })

  return user
}
