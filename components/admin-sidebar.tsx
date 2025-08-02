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
  Images,
  Palette,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { useState, useEffect } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
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
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)

  // Determine if a submenu should be open based on current path
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      title: "Media",
      href: "/admin/media",
      icon: Images,
    },
    {
      title: "Hero",
      href: "/admin/hero",
      icon: Palette,
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

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-4 py-2">
          <Package className="h-6 w-6" />
          <span className="font-semibold">Admin Panel</span>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <SidebarTrigger />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((link) =>
                link.submenu ? (
                  <Collapsible
                    key={link.title}
                    open={openSubmenu === link.title}
                    onOpenChange={() => toggleSubmenu(link.title)}
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton isActive={isSubmenuActive(link.submenu)} className="w-full">
                          <link.icon className="h-4 w-4" />
                          <span>{link.title}</span>
                          <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {link.submenu.map((item) => (
                            <SidebarMenuSubItem key={item.href}>
                              <SidebarMenuSubButton asChild isActive={isLinkActive(item.href)}>
                                <Link href={item.href}>
                                  <ChevronRight className="h-4 w-4" />
                                  <span>{item.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={link.title}>
                    <SidebarMenuButton asChild isActive={isLinkActive(link.href)}>
                      <Link href={link.href}>
                        <link.icon className="h-4 w-4" />
                        <span>{link.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ),
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/">
                <LogOut className="h-4 w-4" />
                <span>Back to Store</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
