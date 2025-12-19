"use client"

import React, { useState } from "react"
import { usePathname } from "next/navigation"
import NavBar from "@/components/nav-bar"
import Footer from "@/components/footer"
import { MobileHeader } from "@/components/mobile"
import SearchModal from "@/components/search-modal"
import CartSidebar from "@/components/cart-sidebar"
import { stripLocaleFromPathname } from "@/lib/i18n/config"
import { useMediaQuery } from "@/hooks/use-media-query"

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const pathNoLocale = stripLocaleFromPathname(pathname || "/")
  const isAdmin = pathNoLocale.startsWith("/admin")
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)

  if (isAdmin) {
    // Admin pages manage their own layout (sidebar, header, etc.)
    return <>{children}</>
  }

  return (
    <>
        <NavBar />
      
      <div className={isMobile ? "pt-0" : ""}>
        {children}
      </div>
      {!isMobile && <Footer />}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}

function getPageTitle(path: string): string | undefined {
  if (path.startsWith("/products")) return "Products"
  if (path.startsWith("/categories")) return "Categories"
  if (path.startsWith("/deals")) return "Deals"
  if (path.startsWith("/account")) return "Account"
  if (path.startsWith("/wishlist")) return "Wishlist"
  if (path.startsWith("/cart")) return "Cart"
  if (path.startsWith("/checkout")) return "Checkout"
  return undefined
}
