"use client";

import { useState } from "react";
import { Filter, X } from "lucide-react";
import { BottomSheet } from "./bottom-sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface FilterGroup {
  id: string;
  label: string;
  type: "checkbox" | "range";
  options?: FilterOption[];
  min?: number;
  max?: number;
  step?: number;
  value?: number[];
}

interface MobileFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterGroup[];
  activeFilters: Record<string, any>;
  onFilterChange: (filterId: string, value: any) => void;
  onClearAll: () => void;
  onApply: () => void;
}

export function MobileFilterSheet({
  isOpen,
  onClose,
  filters,
  activeFilters,
  onFilterChange,
  onClearAll,
  onApply,
}: MobileFilterSheetProps) {
  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Filters"
      height="80%"
    >
      {/* Clear All */}
      {hasActiveFilters && (
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-destructive hover:text-destructive"
          >
            <X className="h-4 w-4 mr-1" />
            Clear all filters
          </Button>
        </div>
      )}

      {/* Filter Groups */}
      <div className="space-y-6">
        {filters.map((group) => (
          <div key={group.id}>
            <h3 className="font-medium mb-3">{group.label}</h3>
            
            {group.type === "checkbox" && group.options && (
              <div className="space-y-2">
                {group.options.map((option) => (
                  <div key={option.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`${group.id}-${option.id}`}
                        checked={activeFilters[group.id]?.includes(option.id) || false}
                        onCheckedChange={(checked) => {
                          const current = activeFilters[group.id] || [];
                          if (checked) {
                            onFilterChange(group.id, [...current, option.id]);
                          } else {
                            onFilterChange(group.id, current.filter((id: string) => id !== option.id));
                          }
                        }}
                      />
                      <label
                        htmlFor={`${group.id}-${option.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {option.label}
                      </label>
                    </div>
                    {option.count !== undefined && (
                      <Badge variant="secondary" className="text-xs">
                        {option.count}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}

            {group.type === "range" && (
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>${activeFilters[group.id]?.[0] || group.min}</span>
                  <span>${activeFilters[group.id]?.[1] || group.max}</span>
                </div>
                <Slider
                  value={activeFilters[group.id] || [group.min || 0, group.max || 100]}
                  onValueChange={(value) => onFilterChange(group.id, value)}
                  max={group.max || 100}
                  min={group.min || 0}
                  step={group.step || 1}
                  className="w-full"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Apply Button */}
      <div className="mt-8 space-y-2">
        <Button onClick={onApply} className="w-full" size="lg">
          Apply Filters
        </Button>
        <Button variant="outline" onClick={onClose} className="w-full" size="lg">
          Cancel
        </Button>
      </div>
    </BottomSheet>
  );
}
