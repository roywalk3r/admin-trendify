"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, Menu, Search, ShoppingBag, X, User } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { ThemeToggle } from "./theme-toggle"
import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs"
import { LayoutDashboard } from "lucide-react"
import { useApi } from "@/lib/hooks/use-api"
import { useCartStore } from "@/lib/store/cart-store"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { usePathname } from "next/navigation"

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { totalItems } = useCartStore()
  const pathname = usePathname()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  return (
      <header
          className={`sticky top-0 z-50 w-full transition-all duration-300 ${
              isScrolled ? "bg-background/95 backdrop-blur-md shadow-sm" : "bg-background"
          }`}
      >
        <div className="container flex h-16 items-center">
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>

          <Link href="/" className="mr-6 flex items-center space-x-2">
            <ShoppingBag className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">ACME Store</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {["Home", "Products", "Categories", "About", "Contact"].map((item) => (
                <Link
                    key={item}
                    href={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                    className="relative transition-colors hover:text-foreground/80"
                >
                  {item}
                  {pathname === (item === "Home" ? "/" : `/${item.toLowerCase()}`) && (
                      <motion.div
                          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
                          layoutId="navbar-indicator"
                      />
                  )}
                </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <AnimatePresence>
              {isSearchOpen ? (
                  <motion.div
                      className="relative"
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "300px", opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                  >
                    <Input type="search" placeholder="Search products..." className="w-full pr-8" autoFocus />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0"
                        onClick={() => setIsSearchOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
              ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
                      <Search className="h-5 w-5" />
                      <span className="sr-only">Search</span>
                    </Button>
                  </motion.div>
              )}
            </AnimatePresence>

            <Button variant="ghost" size="icon" className="ml-2" asChild>
              <Link href="/wishlist">
                <Heart className="h-5 w-5" />
                <span className="sr-only">Wishlist</span>
              </Link>
            </Button>

            <Button variant="ghost" size="icon" className="ml-2 relative" asChild>
              <Link href="/cart">
                <ShoppingBag className="h-5 w-5" />
                <span className="sr-only">Cart</span>
                <AnimatePresence>
                  {totalItems() > 0 && (
                      <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute right-0 top-0 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center"
                      >
                        {totalItems()}
                      </motion.div>
                  )}
                </AnimatePresence>
              </Link>
            </Button>

            <ThemeToggle />

            <div className="flex items-center space-x-3">
              <SignedOut>
                <Button variant="ghost" size="sm" asChild>
                  <SignInButton mode="modal">
                  </SignInButton>
                </Button>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
              <AdminLink />
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <Link href="/" className="flex items-center space-x-2" onClick={() => setMobileMenuOpen(false)}>
                  <ShoppingBag className="h-6 w-6" />
                  <span className="font-bold">ACME Store</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="mb-6">
                <Input type="search" placeholder="Search products..." className="w-full" />
              </div>

              <nav className="flex flex-col space-y-4 text-lg font-medium">
                {["Home", "Products", "Categories", "About", "Contact"].map((item) => (
                    <Link
                        key={item}
                        href={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                        className="py-2 transition-colors hover:text-primary"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                      {item}
                    </Link>
                ))}
              </nav>

              <div className="mt-auto pt-6 border-t">
                <div className="flex flex-col space-y-4">
                  <Link
                      href="/account"
                      className="flex items-center py-2 transition-colors hover:text-primary"
                      onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-5 w-5 mr-2" />
                    My Account
                  </Link>
                  <Link
                      href="/wishlist"
                      className="flex items-center py-2 transition-colors hover:text-primary"
                      onClick={() => setMobileMenuOpen(false)}
                  >
                    <Heart className="h-5 w-5 mr-2" />
                    Wishlist
                  </Link>
                  <Link
                      href="/cart"
                      className="flex items-center py-2 transition-colors hover:text-primary"
                      onClick={() => setMobileMenuOpen(false)}
                  >
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Cart
                    {totalItems() > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {totalItems()}
                        </Badge>
                    )}
                  </Link>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </header>
  )
}

function AdminLink() {
  const [isAdmin, setIsAdmin] = useState(false)
  const { data } = useApi<any>("/api/admin/check")
console.log(data, "Admin Chexc")
  useEffect(() => {
    if (data?.isAdmin) {
      setIsAdmin(true)
    }
  }, [data])

  if (!isAdmin) return null

  return (
      <Button variant="ghost" size="icon" className="ml-2" asChild>
        <Link href="/admin">
          <LayoutDashboard className="h-5 w-5" />
          <span className="sr-only">Admin Dashboard</span>
        </Link>
      </Button>
  )
}
