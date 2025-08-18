"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useApiMutation } from "@/lib/hooks/use-api"
import { toast } from "@/hooks/use-toast"
import { ChevronDown, Download } from "lucide-react"

interface BulkActionsProps {
  selectedIds: string[]
  entityType: "products" | "orders" | "users"
  onSuccess?: () => void
}

type ActionItem = { label: string; action: string; data?: any; destructive?: boolean }

export function BulkActions({ selectedIds, entityType, onSuccess }: BulkActionsProps) {
  const [isExporting, setIsExporting] = useState(false)

  const bulkMutation = useApiMutation("/api/admin/bulk", {
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message,
      })
      onSuccess?.()
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const handleBulkAction = (action: string, data?: any) => {
    bulkMutation.mutate({
      action,
      entityType,
      ids: selectedIds,
      data,
    })
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const response = await fetch(`/api/admin/export?type=${entityType}&format=csv`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${entityType}-export.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Export Complete",
        description: `${entityType} data exported successfully`,
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const getActions = (): ActionItem[] => {
    switch (entityType) {
      case "products":
        return [
          { label: "Activate", action: "activate" },
          { label: "Deactivate", action: "deactivate" },
          { label: "Feature", action: "feature" },
          { label: "Unfeature", action: "unfeature" },
          { label: "Delete", action: "delete", destructive: true },
        ]
      case "orders":
        return [
          { label: "Mark as Processing", action: "update", data: { status: "processing" } },
          { label: "Mark as Shipped", action: "update", data: { status: "shipped" } },
          { label: "Mark as Delivered", action: "update", data: { status: "delivered" } },
        ]
      case "users":
        return [
          { label: "Activate", action: "update", data: { isActive: true } },
          { label: "Deactivate", action: "update", data: { isActive: false } },
        ]
      default:
        return []
    }
  }

  if (selectedIds.length === 0) {
    return (
      <Button variant="outline" onClick={handleExport} disabled={isExporting}>
        <Download className="h-4 w-4 mr-2" />
        {isExporting ? "Exporting..." : "Export"}
      </Button>
    )
  }

  return (
    <div className="flex gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={bulkMutation.isPending}>
            Bulk Actions ({selectedIds.length}) <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {getActions().map((action) => (
            <DropdownMenuItem
              key={action.label}
              onClick={() => handleBulkAction(action.action, action.data)}
              className={action.destructive ? "text-red-600" : ""}
            >
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="outline" onClick={handleExport} disabled={isExporting}>
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>
    </div>
  )
}
