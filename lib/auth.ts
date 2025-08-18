import { auth } from "@clerk/nextjs/server"

import { prisma } from "@/lib/prisma"

export async function getCurrentUser() {
  const { userId } =  await auth()

  if (!userId) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  })

  return user
}
