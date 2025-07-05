"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Settings,
  Tag,
  BarChart,
  LogOut,
  Database,
  RefreshCw,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useClerk } from "@clerk/nextjs"
import { ThemeToggle } from "@/components/theme-toggle"

export default function AdminSidebar() {
  const pathname = usePathname()
  const { signOut } = useClerk()

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/admin",
      active: pathname === "/admin",
    },
    {
      label: "Products",
      icon: Package,
      href: "/admin/products",
      active: pathname.includes("/admin/products"),
    },
    {
      label: "Categories",
      icon: Tag,
      href: "/admin/categories",
      active: pathname.includes("/admin/categories"),
    },
    {
      label: "Orders",
      icon: ShoppingCart,
      href: "/admin/orders",
      active: pathname.includes("/admin/orders"),
    },
    {
      label: "Users",
      icon: Users,
      href: "/admin/users",
      active: pathname.includes("/admin/users"),
    },
    {
      label: "Analytics",
      icon: BarChart,
      href: "/admin/analytics",
      active: pathname.includes("/admin/analytics"),
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/admin/settings",
      active: pathname.includes("/admin/settings"),
    },
    {
      label: "Database Tools",
      icon: Database,
      href: "/admin/fix-schema",
      active: pathname.includes("/admin/fix-schema"),
    },
    {
      label: "Seed Data",
      icon: RefreshCw,
      href: "/admin/seed",
      active: pathname.includes("/admin/seed"),
    },
  ]

  return (
    <div className="flex flex-col h-full w-64 border-r bg-muted/40">
      <div className="p-6 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2 font-bold text-xl">
          <Package className="h-6 w-6" />
          <span>Admin Panel</span>
        </Link>
        <ThemeToggle />
      </div>
      <div className="flex-1 px-3 py-2 space-y-1">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              route.active ? "bg-primary text-primary-foreground" : "hover:bg-muted hover:text-foreground",
            )}
          >
            <route.icon className="h-4 w-4" />
            {route.label}
          </Link>
        ))}
      </div>
      <div className="p-4 mt-auto border-t">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-full bg-muted h-10 w-10 flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-muted-foreground">admin@example.com</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => signOut(() => (window.location.href = "/"))}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}

