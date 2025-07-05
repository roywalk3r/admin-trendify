"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Settings,
  BarChart,
  LogOut,
  Menu,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface SidebarLink {
  title: string
  href: string
  icon: React.ElementType
  submenu?: { title: string; href: string }[]
}

export function AdminSidebar() {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)

  // Close mobile sidebar when path changes
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  // Determine if a submenu should be open based on current path
  useEffect(() => {
    const currentSection = links.find(
      (link) => link.submenu?.some((item) => pathname === item.href) || pathname === link.href,
    )

    if (currentSection?.submenu) {
      setOpenSubmenu(currentSection.title)
    }
  }, [pathname])

  const links: SidebarLink[] = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Products",
      href: "/admin/products",
      icon: Package,
      submenu: [
        { title: "All Products", href: "/admin/products" },
        { title: "Add Product", href: "/admin/products/new" },
        { title: "Categories", href: "/admin/categories" },
      ],
    },
    {
      title: "Orders",
      href: "/admin/orders",
      icon: ShoppingCart,
    },
    {
      title: "Customers",
      href: "/admin/users",
      icon: Users,
    },
    {
      title: "Analytics",
      href: "/admin/analytics",
      icon: BarChart,
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ]

  const toggleSubmenu = (title: string) => {
    setOpenSubmenu(openSubmenu === title ? null : title)
  }

  const isLinkActive = (href: string) => {
    return pathname === href
  }

  const isSubmenuActive = (submenu?: { title: string; href: string }[]) => {
    return submenu?.some((item) => pathname === item.href)
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/admin" className="flex items-center gap-2 font-semibold">
          <Package className="h-6 w-6" />
          <span>Admin Panel</span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
      <ScrollArea className="flex-1 py-2">
        <nav className="grid gap-1 px-2">
          {links.map((link) =>
            link.submenu ? (
              <Collapsible
                key={link.title}
                open={openSubmenu === link.title}
                onOpenChange={() => toggleSubmenu(link.title)}
                className="w-full"
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant={isSubmenuActive(link.submenu) ? "secondary" : "ghost"}
                    className="w-full justify-start gap-2"
                  >
                    <link.icon className="h-4 w-4" />
                    {link.title}
                    <ChevronDown
                      className={`ml-auto h-4 w-4 transition-transform ${openSubmenu === link.title ? "rotate-180" : ""}`}
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-6 pt-1">
                  {link.submenu.map((item) => (
                    <Button
                      key={item.href}
                      variant={isLinkActive(item.href) ? "secondary" : "ghost"}
                      className="w-full justify-start gap-2 mb-1"
                      asChild
                    >
                      <Link href={item.href}>
                        <ChevronRight className="h-4 w-4" />
                        {item.title}
                      </Link>
                    </Button>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <Button
                key={link.title}
                variant={isLinkActive(link.href) ? "secondary" : "ghost"}
                className="w-full justify-start gap-2"
                asChild
              >
                <Link href={link.href}>
                  <link.icon className="h-4 w-4" />
                  {link.title}
                </Link>
              </Button>
            ),
          )}
        </nav>
      </ScrollArea>
      <div className="mt-auto border-t p-4">
        <Button variant="outline" className="w-full justify-start gap-2" asChild>
          <Link href="/">
            <LogOut className="h-4 w-4" />
            Back to Store
          </Link>
        </Button>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden w-64 border-r bg-background lg:block">
        <SidebarContent />
      </aside>
      <div className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 lg:hidden">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6" />
          <span className="font-semibold">Admin Panel</span>
        </div>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>
    </>
  )
}
