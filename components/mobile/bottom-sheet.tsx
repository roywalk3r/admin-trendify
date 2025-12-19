"use client";

import { forwardRef, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Drawer as VaulDrawer } from "vaul";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  height?: "auto" | "content" | "80%" | "90%";
  showCloseButton?: boolean;
  dismissible?: boolean;
}

export const BottomSheet = forwardRef<HTMLDivElement, BottomSheetProps>(
  (
    {
      isOpen,
      onClose,
      title,
      children,
      height = "auto",
      showCloseButton = true,
      dismissible = true,
    },
    ref
  ) => {
    // Prevent body scroll when open
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
      return () => {
        document.body.style.overflow = "";
      };
    }, [isOpen]);

    const getHeightClass = () => {
      switch (height) {
        case "80%":
          return "h-[80vh]";
        case "90%":
          return "h-[90vh]";
        case "content":
          return "h-auto max-h-[80vh]";
        default:
          return "h-auto max-h-[70vh]";
      }
    };

    return (
      <VaulDrawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <VaulDrawer.Portal>
          <VaulDrawer.Overlay className="fixed inset-0 z-50 bg-black/50" />
          <VaulDrawer.Content
            ref={ref}
            className={cn(
              "fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-[20px] bg-background",
              getHeightClass(),
              "focus:outline-none"
            )}
          >
            {/* Handle */}
            <div className="mx-auto mt-3 h-1.5 w-12 flex-shrink-0 rounded-full bg-muted" />
            
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between px-6 py-4 border-b">
                {title && (
                  <h2 className="text-lg font-semibold">{title}</h2>
                )}
                {showCloseButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="h-[var(--mobile-touch-target)] w-[var(--mobile-touch-target)]"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {children}
            </div>
          </VaulDrawer.Content>
        </VaulDrawer.Portal>
      </VaulDrawer.Root>
    );
  }
);

BottomSheet.displayName = "BottomSheet";
