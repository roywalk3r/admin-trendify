"use client"

import React from "react"
import { usePathname } from "next/navigation"
import NavBar from "@/components/nav-bar"
import Footer from "@/components/footer"
import { stripLocaleFromPathname } from "@/lib/i18n/config"

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const pathNoLocale = stripLocaleFromPathname(pathname || "/")
  const isAdmin = pathNoLocale.startsWith("/admin")

  if (isAdmin) {
    // Admin pages manage their own layout (sidebar, header, etc.)
    return <>{children}</>
  }

  return (
    <>
      <NavBar />
      {children}
      <Footer />
    </>
  )
}
