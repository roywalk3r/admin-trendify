"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

interface AccordionProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileAccordion({ children, className }: AccordionProps) {
  return <div className={cn("space-y-2", className)}>{children}</div>;
}

export function MobileAccordionItem({
  title,
  children,
  defaultOpen = false,
}: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border rounded-lg">
      <Button
        variant="ghost"
        className="w-full justify-between h-auto p-4 text-left font-medium"
        onClick={() => setIsOpen(!isOpen)}
      >
        {title}
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </Button>
      {isOpen && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}
