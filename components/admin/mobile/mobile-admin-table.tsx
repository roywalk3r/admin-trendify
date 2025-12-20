"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MoreVertical, Edit, Trash2, Eye, ChevronDown, Filter, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

interface Column {
  key: string
  label: string
  render?: (value: any, row: any) => React.ReactNode
  sortable?: boolean
  searchable?: boolean
}

interface Action {
  label: string
  icon: React.ComponentType<{ className?: string }>
  onClick: (row: any) => void
  variant?: 'default' | 'destructive' | 'outline'
}

interface MobileAdminTableProps {
  data: any[]
  columns: Column[]
  actions?: Action[]
  title: string
  searchPlaceholder?: string
  filters?: {
    key: string
    label: string
    options: { value: string; label: string }[]
  }[]
  onSelectionChange?: (selectedIds: string[]) => void
  bulkActions?: Action[]
}

export default function MobileAdminTable({
  data,
  columns,
  actions = [],
  title,
  searchPlaceholder = "Search...",
  filters = [],
  onSelectionChange,
  bulkActions = []
}: MobileAdminTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [filterValues, setFilterValues] = useState<Record<string, string>>({})
  const [showFilters, setShowFilters] = useState(false)

  // Filter and search data
  const filteredData = data.filter(item => {
    // Search filter
    if (searchTerm) {
      const searchableColumns = columns.filter(col => col.searchable !== false)
      const matchesSearch = searchableColumns.some(col => 
        String(item[col.key]).toLowerCase().includes(searchTerm.toLowerCase())
      )
      if (!matchesSearch) return false
    }

    // Other filters
    for (const [key, value] of Object.entries(filterValues)) {
      if (value && item[key] !== value) return false
    }

    return true
  })

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortBy) return 0
    const aVal = a[sortBy]
    const bVal = b[sortBy]
    const order = sortOrder === "asc" ? 1 : -1
    return aVal < bVal ? -order : aVal > bVal ? order : 0
  })

  const handleSelectItem = (itemId: string, checked: boolean) => {
    const newSelection = checked 
      ? [...selectedItems, itemId]
      : selectedItems.filter(id => id !== itemId)
    setSelectedItems(newSelection)
    onSelectionChange?.(newSelection)
  }

  const handleSelectAll = (checked: boolean) => {
    const newSelection = checked ? sortedData.map(item => item.id) : []
    setSelectedItems(newSelection)
    onSelectionChange?.(newSelection)
  }

  const resetFilters = () => {
    setSearchTerm("")
    setFilterValues({})
    setSortBy("")
    setSortOrder("asc")
  }

  return (
    <div className="space-y-4">
      {/* Header with Search and Filters */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">
            {sortedData.length} {sortedData.length === 1 ? 'item' : 'items'}
            {selectedItems.length > 0 && ` • ${selectedItems.length} selected`}
          </p>
        </div>

        <div className="flex space-x-2">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          {/* Filters */}
          {filters.length > 0 && (
            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filters & Sorting</SheetTitle>
                </SheetHeader>
                <div className="space-y-4 mt-6">
                  {/* Sort Options */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Sort by</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose field..." />
                      </SelectTrigger>
                      <SelectContent>
                        {columns.filter(col => col.sortable !== false).map(column => (
                          <SelectItem key={column.key} value={column.key}>
                            {column.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {sortBy && (
                      <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => setSortOrder(value)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="asc">Ascending</SelectItem>
                          <SelectItem value="desc">Descending</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Filter Options */}
                  {filters.map(filter => (
                    <div key={filter.key}>
                      <label className="text-sm font-medium mb-2 block">{filter.label}</label>
                      <Select 
                        value={filterValues[filter.key] || ""} 
                        onValueChange={(value) => setFilterValues(prev => ({ ...prev, [filter.key]: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All</SelectItem>
                          {filter.options.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}

                  <Button onClick={resetFilters} variant="outline" className="w-full">
                    Reset Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      {bulkActions.length > 0 && selectedItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 p-3 bg-muted rounded-lg"
        >
          <span className="text-sm font-medium">{selectedItems.length} selected</span>
          <div className="flex space-x-1">
            {bulkActions.map((action, index) => (
              <Button
                key={index}
                size="sm"
                variant={action.variant || "outline"}
                onClick={() => {
                  const selectedRows = sortedData.filter(item => selectedItems.includes(item.id))
                  selectedRows.forEach(action.onClick)
                  setSelectedItems([])
                }}
                className="h-8"
              >
                <action.icon className="h-4 w-4 mr-1" />
                {action.label}
              </Button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Select All */}
      {onSelectionChange && (
        <div className="flex items-center space-x-2 py-2">
          <Checkbox
            checked={selectedItems.length === sortedData.length && sortedData.length > 0}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm">Select all</span>
        </div>
      )}

      {/* Mobile Cards */}
      <div className="space-y-3">
        <AnimatePresence>
          {sortedData.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center p-4">
                    {onSelectionChange && (
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={(checked) => handleSelectItem(item.id, !!checked)}
                        className="mr-3"
                      />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      {/* Primary Information */}
                      <div className="space-y-2">
                        {columns.slice(0, 3).map(column => (
                          <div key={column.key} className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">
                              {column.label}:
                            </span>
                            <div className="text-sm">
                              {column.render ? column.render(item[column.key], item) : item[column.key]}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Additional Information (Collapsible) */}
                      {columns.length > 3 && (
                        <details className="mt-3 group">
                          <summary className="flex items-center cursor-pointer text-sm text-muted-foreground">
                            <ChevronDown className="h-4 w-4 mr-1 transition-transform group-open:rotate-180" />
                            Show more details
                          </summary>
                          <div className="mt-2 space-y-2 pl-5">
                            {columns.slice(3).map(column => (
                              <div key={column.key} className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">
                                  {column.label}:
                                </span>
                                <div className="text-sm">
                                  {column.render ? column.render(item[column.key], item) : item[column.key]}
                                </div>
                              </div>
                            ))}
                          </div>
                        </details>
                      )}
                    </div>

                    {/* Actions */}
                    {actions.length > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {actions.map((action, actionIndex) => (
                            <DropdownMenuItem
                              key={actionIndex}
                              onClick={() => action.onClick(item)}
                              className={action.variant === 'destructive' ? 'text-destructive' : ''}
                            >
                              <action.icon className="h-4 w-4 mr-2" />
                              {action.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty State */}
        {sortedData.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-muted-foreground text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Search className="h-8 w-8" />
                </div>
                <h3 className="font-semibold mb-2">No items found</h3>
                <p className="text-sm">
                  {searchTerm || Object.values(filterValues).some(Boolean)
                    ? "Try adjusting your search or filters"
                    : "No items available"}
                </p>
                {(searchTerm || Object.values(filterValues).some(Boolean)) && (
                  <Button variant="outline" onClick={resetFilters} className="mt-4">
                    Clear filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
