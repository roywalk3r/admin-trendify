"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Loader2, Filter, X } from "lucide-react"
import { toast } from "sonner"

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState("")
  const [paymentStatus, setPaymentStatus] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [hasActiveFilters, setHasActiveFilters] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async (queryString = "") => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/orders${queryString}`)
      const data = await response.json()
      console.log(data)
      if (data.data.orders) {
        setOrders(data.data.orders)
      } else {
        toast.error("Error", {
          description: "Failed to load orders",
        })
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast.error("Error", {
        description: "Failed to load orders",
      })
    } finally {
      setLoading(false)
    }
  }

  const buildQueryString = () => {
    const params = new URLSearchParams()
    if (status) params.append("status", status)
    if (paymentStatus) params.append("paymentStatus", paymentStatus)
    if (customerEmail) params.append("customerEmail", customerEmail)

    const queryString = params.toString()
    return queryString ? `?${queryString}` : ""
  }

  const applyFilters = () => {
    const queryString = buildQueryString()
    fetchOrders(queryString)
    setHasActiveFilters(!!status || !!paymentStatus || !!customerEmail)
  }

  const resetFilters = () => {
    setStatus("")
    setPaymentStatus("")
    setCustomerEmail("")
    fetchOrders()
    setHasActiveFilters(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "shipped":
        return "bg-blue-100 text-blue-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "canceled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "unpaid":
        return "bg-red-100 text-red-800"
      case "refunded":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const activeFilterCount = [status ? 1 : 0, paymentStatus ? 1 : 0, customerEmail ? 1 : 0].reduce((a, b) => a + b, 0)

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Orders</h1>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h3 className="font-medium">Filter Orders</h3>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Order Status</label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="canceled">Canceled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Payment Status</label>
                  <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any payment status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any payment status</SelectItem>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Customer Email</label>
                  <Input
                    placeholder="Enter customer email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                  />
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={resetFilters}>
                    Reset
                  </Button>
                  <Button onClick={applyFilters}>Apply Filters</Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mb-4 flex flex-wrap gap-2">
          {status && (
            <Badge variant="outline" className="flex items-center gap-1">
              Status: {status}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  setStatus("")
                  applyFilters()
                }}
              />
            </Badge>
          )}
          {paymentStatus && (
            <Badge variant="outline" className="flex items-center gap-1">
              Payment: {paymentStatus}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  setPaymentStatus("")
                  applyFilters()
                }}
              />
            </Badge>
          )}
          {customerEmail && (
            <Badge variant="outline" className="flex items-center gap-1">
              Email: {customerEmail}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  setCustomerEmail("")
                  applyFilters()
                }}
              />
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Clear all
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No orders found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id.substring(0, 8)}</TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>{order.user?.email || "N/A"}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(Number(order.totalAmount))}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/admin/orders/${order.id}`)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
