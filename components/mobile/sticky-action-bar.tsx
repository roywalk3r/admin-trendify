"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface StickyActionBarProps {
  children: React.ReactNode;
  className?: string;
  position?: "bottom" | "top";
  shadow?: boolean;
}

export const StickyActionBar = forwardRef<HTMLDivElement, StickyActionBarProps>(
  ({ children, className, position = "bottom", shadow = true }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "fixed left-0 right-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b",
          position === "bottom" ? "bottom-0 border-t" : "top-0 border-b",
          shadow && "shadow-lg",
          className
        )}
        style={
          position === "bottom"
            ? { paddingBottom: "env(safe-area-inset-bottom)" }
            : { paddingTop: "env(safe-area-inset-top)" }
        }
      >
        <div
          className="flex items-center justify-between px-4 py-3 gap-3"
          style={{ minHeight: "var(--mobile-action-bar-height)" }}
        >
          {children}
        </div>
      </div>
    );
  }
);

StickyActionBar.displayName = "StickyActionBar";
