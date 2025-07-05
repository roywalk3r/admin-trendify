"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, X, ShoppingBag, Home, Package, Grid, Info, Phone } from "lucide-react"
import type { Settings } from "@/types"

interface MobileNavProps {
  settings?: Settings
}

export function MobileNav({ settings }: MobileNavProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const routes = [
    {
      href: "/",
      label: "Home",
      icon: Home,
      active: pathname === "/",
    },
    {
      href: "/products",
      label: "Products",
      icon: Package,
      active: pathname === "/products",
    },
    {
      href: "/categories",
      label: "Categories",
      icon: Grid,
      active: pathname === "/categories",
    },
    {
      href: "/about",
      label: "About",
      icon: Info,
      active: pathname === "/about",
    },
    {
      href: "/contact",
      label: "Contact",
      icon: Phone,
      active: pathname === "/contact",
    },
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="flex items-center space-x-2" onClick={() => setOpen(false)}>
            <ShoppingBag className="h-6 w-6" />
            <span className="font-bold">{settings?.general?.siteName || "ACME Store"}</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
            <X className="h-5 w-5" />
            <span className="sr-only">Close menu</span>
          </Button>
        </div>
        <nav className="flex flex-col space-y-4">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className="flex items-center gap-2 text-base font-medium transition-colors hover:text-primary"
              onClick={() => setOpen(false)}
            >
              <route.icon className="h-5 w-5" />
              {route.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
