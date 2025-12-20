"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Search, ShoppingCart, Heart, User, Home, Grid3X3, Package, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useCartStore } from "@/lib/store/cart-store"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useI18n } from "@/lib/i18n/I18nProvider"
import { addLocaleToPathname, getLocaleFromPathname } from "@/lib/i18n/config"

interface MobileNavProps {
  className?: string
}

export default function MobileNav({ className }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [wishlistCount, setWishlistCount] = useState(0)
  const { items } = useCartStore()
  const { isSignedIn, user } = useUser()
  const { t } = useI18n()
  const pathname = usePathname() || "/"
  const locale = getLocaleFromPathname(pathname)

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0)

  // Navigation items
  const navItems = [
    { href: "/", icon: Home, label: t("nav.home") },
    { href: "/products", icon: Grid3X3, label: t("nav.products") },
    { href: "/categories", icon: Package, label: t("nav.categories") },
    ...(isSignedIn ? [
      { href: "/profile", icon: User, label: t("nav.profile") },
      { href: "/orders", icon: Package, label: t("nav.orders") }
    ] : []),
  ]

  // Admin nav items (if user is admin)
  const adminNavItems = [
    { href: "/admin", icon: Settings, label: "Dashboard" },
    { href: "/admin/products", icon: Package, label: "Products" },
    { href: "/admin/orders", icon: Package, label: "Orders" },
    { href: "/admin/users", icon: User, label: "Users" },
  ]

  // Fetch wishlist count
  useEffect(() => {
    if (!isSignedIn) return
    
    const fetchWishlistCount = async () => {
      try {
        const response = await fetch("/api/wishlist/count")
        if (response.ok) {
          const data = await response.json()
          setWishlistCount(data.count || 0)
        }
      } catch (error) {
        console.error("Failed to fetch wishlist count:", error)
      }
    }

    fetchWishlistCount()

    // Listen for wishlist updates
    const handleWishlistUpdate = () => fetchWishlistCount()
    window.addEventListener("wishlist:updated", handleWishlistUpdate)
    return () => window.removeEventListener("wishlist:updated", handleWishlistUpdate)
  }, [isSignedIn])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setIsOpen(false)
      window.location.href = addLocaleToPathname(`/search?q=${encodeURIComponent(searchQuery)}`, locale)
    }
  }

  const isActivePage = (href: string) => {
    if (href === "/") return pathname === addLocaleToPathname("/", locale)
    return pathname.startsWith(addLocaleToPathname(href, locale))
  }

  return (
    <>
      {/* Mobile Header */}
      <div className={`md:hidden sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b ${className}`}>
        <div className="flex items-center justify-between p-4">
          {/* Logo */}
          <Link href={addLocaleToPathname("/", locale)} className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="font-bold text-lg text-foreground">Trendify</span>
          </Link>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Search Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Search className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="top" className="h-auto">
                <form onSubmit={handleSearch} className="mt-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder={t("search.placeholder")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1"
                      autoFocus
                    />
                    <Button type="submit">{t("search.button")}</Button>
                  </div>
                </form>
              </SheetContent>
            </Sheet>

            {/* Wishlist */}
            {isSignedIn && (
              <Link href={addLocaleToPathname("/wishlist", locale)}>
                <Button variant="ghost" size="icon" className="relative">
                  <Heart className="h-5 w-5" />
                  {wishlistCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                      {wishlistCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}

            {/* Cart */}
            <Link href={addLocaleToPathname("/cart", locale)}>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Menu Button */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="py-6">
                  {/* User Info */}
                  {isSignedIn ? (
                    <div className="flex items-center space-x-3 mb-6 pb-6 border-b">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{user?.fullName || user?.emailAddresses?.[0]?.emailAddress}</p>
                        <p className="text-sm text-muted-foreground">{t("nav.welcomeBack")}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6 pb-6 border-b">
                      <Link href={addLocaleToPathname("/sign-in", locale)}>
                        <Button className="w-full mb-2">{t("auth.signIn")}</Button>
                      </Link>
                      <Link href={addLocaleToPathname("/sign-up", locale)}>
                        <Button variant="outline" className="w-full">{t("auth.signUp")}</Button>
                      </Link>
                    </div>
                  )}

                  {/* Navigation */}
                  <nav className="space-y-1">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={addLocaleToPathname(item.href, locale)}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                          isActivePage(item.href)
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent hover:text-accent-foreground"
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    ))}

                    {/* Admin Section */}
                    {isSignedIn && user?.publicMetadata?.role !== "customer" && (
                      <>
                        <div className="py-2">
                          <div className="h-px bg-border" />
                        </div>
                        <div className="mb-2">
                          <p className="px-3 text-sm font-medium text-muted-foreground">{t("nav.admin")}</p>
                        </div>
                        {adminNavItems.map((item) => (
                          <Link
                            key={item.href}
                            href={addLocaleToPathname(item.href, locale)}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                              isActivePage(item.href)
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-accent hover:text-accent-foreground"
                            }`}
                          >
                            <item.icon className="h-5 w-5" />
                            <span>{item.label}</span>
                          </Link>
                        ))}
                      </>
                    )}
                  </nav>

                  {/* Footer Actions */}
                  {isSignedIn && (
                    <div className="mt-6 pt-6 border-t">
                      <Link href={addLocaleToPathname("/sign-out", locale)}>
                        <Button variant="outline" className="w-full" onClick={() => setIsOpen(false)}>
                          {t("auth.signOut")}
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
        <div className="grid grid-cols-4 py-2">
          {navItems.slice(0, 4).map((item) => (
            <Link
              key={item.href}
              href={addLocaleToPathname(item.href, locale)}
              className={`flex flex-col items-center justify-center py-2 px-1 transition-colors ${
                isActivePage(item.href)
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
