"use client";

import { useState } from "react";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MobileDrawer } from "./mobile-drawer";
import { useCart } from "@/hooks/use-cart";

interface MobileHeaderProps {
  onSearchClick: () => void;
  onCartClick: () => void;
  title?: string;
  showLogo?: boolean;
}

export function MobileHeader({
  onSearchClick,
  onCartClick,
  title,
  showLogo = true,
}: MobileHeaderProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { items } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <header
        className="sticky top-0 z-50 flex h-[var(--mobile-header-height)] w-full items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b"
        style={{ height: "var(--mobile-header-height)" }}
      >
        {/* Left: Hamburger */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsDrawerOpen(true)}
          className="h-[var(--mobile-touch-target)] w-[var(--mobile-touch-target)]"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Center: Logo or Title */}
        <div className="flex-1 text-center">
          {title ? (
            <h1 className="text-lg font-semibold truncate px-2">{title}</h1>
          ) : showLogo ? (
            <div className="flex items-center justify-center">
              <span className="text-xl font-bold">Trendify</span>
            </div>
          ) : null}
        </div>

        {/* Right: Search and Cart */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSearchClick}
            className="h-[var(--mobile-touch-target)] w-[var(--mobile-touch-target)]"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCartClick}
            className="relative h-[var(--mobile-touch-target)] w-[var(--mobile-touch-target)]"
            aria-label={`Cart with ${itemCount} items`}
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
              >
                {itemCount > 99 ? "99+" : itemCount}
              </Badge>
            )}
          </Button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
}
