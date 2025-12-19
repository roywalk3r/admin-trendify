"use client";

import { forwardRef } from "react";
import { X, Home, ShoppingBag, User, Heart, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer = forwardRef<HTMLDivElement, MobileDrawerProps>(
  ({ isOpen, onClose }, ref) => {
    const pathname = usePathname();
    const { items } = useCart();
    const { items: wishlistItems } = useWishlist();
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const wishlistCount = wishlistItems.length;

    const menuItems = [
      {
        href: "/",
        label: "Home",
        icon: Home,
        active: pathname === "/",
      },
      {
        href: "/products",
        label: "Shop",
        icon: ShoppingBag,
        active: pathname.startsWith("/products"),
        badge: itemCount > 0 ? (itemCount > 99 ? "99+" : itemCount.toString()) : undefined,
      },
      {
        href: "/wishlist",
        label: "Wishlist",
        icon: Heart,
        active: pathname === "/wishlist",
        badge: wishlistCount > 0 ? (wishlistCount > 99 ? "99+" : wishlistCount.toString()) : undefined,
      },
      {
        href: "/account",
        label: "Account",
        icon: User,
        active: pathname.startsWith("/account"),
      },
    ];

    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent
          side="left"
          className="w-[280px] sm:w-[320px] overflow-y-auto"
          ref={ref}
        >
          <SheetHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-lg font-semibold">Menu</SheetTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-[var(--mobile-touch-target)] w-[var(--mobile-touch-target)]"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </SheetHeader>

          <nav className="flex flex-col gap-1 py-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} onClick={onClose}>
                  <Button
                    variant={item.active ? "secondary" : "ghost"}
                    className="w-full justify-start h-[var(--mobile-touch-target)] gap-3"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto border-t pt-4">
            <Link href="/account/settings" onClick={onClose}>
              <Button
                variant="ghost"
                className="w-full justify-start h-[var(--mobile-touch-target)] gap-3"
              >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </Button>
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    );
  }
);

MobileDrawer.displayName = "MobileDrawer";
