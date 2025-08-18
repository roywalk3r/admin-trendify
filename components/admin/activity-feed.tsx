"use client"

import { useApi } from "@/lib/hooks/use-api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns"

interface AuditLog {
  id: string
  action: string
  entityType: string
  entityId: string
  createdAt: string
  user?: {
    name: string
    email: string
  }
}

export function ActivityFeed() {
  const { data: logs, isLoading } = useApi<{ logs: AuditLog[] }>("/api/admin/audit?limit=20")

  const getActionColor = (action: string) => {
    switch (action) {
      case "CREATE":
        return "bg-green-100 text-green-800"
      case "UPDATE":
        return "bg-blue-100 text-blue-800"
      case "DELETE":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case "CREATE":
        return "+"
      case "UPDATE":
        return "✏️"
      case "DELETE":
        return "🗑️"
      default:
        return "•"
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {logs?.logs?.map((log) => (
              <div key={log.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                <div className="flex-shrink-0">
                  <Badge className={getActionColor(log.action)}>
                    {getActionIcon(log.action)} {log.action}
                  </Badge>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {log.user?.name || "System"} {log.action.toLowerCase()}d a {log.entityType.toLowerCase()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
