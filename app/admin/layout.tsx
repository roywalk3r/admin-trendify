import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import AdminSidebar from "@/components/admin/sidebar"
import prisma from "@/lib/prisma"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  // Check if user is authenticated
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in?redirect_url=/admin")
  }

  try {
    // Try to check admin status with flexible approach to handle schema differences
    let isAdmin = false

    try {
      // First try with the new snake_case schema
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      })

      isAdmin = user?.role === "admin"
    } catch (error) {
      console.log("Error with snake_case schema, trying PascalCase...")

      try {
        // Try with PascalCase schema
        const result = await prisma.$queryRaw`
          SELECT "role" FROM "users" WHERE id = ${userId}
        `

        if (Array.isArray(result) && result.length > 0) {
          isAdmin = result[0].role === "admin"
        }
      } catch (innerError) {
        console.error("Error with PascalCase schema:", innerError)
        // Both approaches failed, redirect to fix-schema page
        redirect("/admin/fix-schema")
      }
    }

    if (!isAdmin) {
      redirect("/")
    }
  } catch (error) {
    console.error("Database error:", error)
    // Redirect to the fix-schema page
    redirect("/admin/fix-schema")
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <div className="flex-1 overflow-auto">
          <div className="container p-6 mx-auto">{children}</div>
        </div>
      </div>
      <Toaster />
    </ThemeProvider>
  )
}
