"use client"

import { useEffect, useState } from "react"
import { useApi } from "@/lib/hooks/use-api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Package, CreditCard, Eye } from "lucide-react"

export default function AdminRecentOrders() {
  const { data, isLoading } = useApi<any>("/api/admin/dashboard")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || isLoading) {
    return <OrdersLoading />
  }

  const recentOrders = data?.recentOrders || []

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "shipped":
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentBadgeColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-gray-100 text-gray-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "refunded":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentOrders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                No recent orders
              </TableCell>
            </TableRow>
          ) : (
            recentOrders.map((order: any) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id.substring(0, 8)}</TableCell>
                <TableCell>{order.user?.name || order.user?.email || "N/A"}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(order.status)}`}
                  >
                    <Package className="h-3 w-3 mr-1" />
                    {order.status}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPaymentBadgeColor(order.paymentStatus)}`}
                  >
                    <CreditCard className="h-3 w-3 mr-1" />
                    {order.paymentStatus}
                  </span>
                </TableCell>
                <TableCell>${Number(order.totalAmount)?.toFixed(2)}</TableCell>
                <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function OrdersLoading() {
  return (
    <div className="space-y-2">
      {Array(5)
        .fill(0)
        .map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
    </div>
  )
}
