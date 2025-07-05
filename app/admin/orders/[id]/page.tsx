"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import type { Order } from "@/types/product"
export default function OrderDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [status, setStatus] = useState("")
  const [paymentStatus, setPaymentStatus] = useState("")

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/admin/orders/${id}`)
        const data = await response.json()
        console.log(data.data)
        if (data.data) {
          setOrder(data.data)
          setStatus(data.data.status)
          setPaymentStatus(data.data.paymentStatus)
        } else {
          toast.error("Error", {
            description: "Failed to load order details",
          })
        }
      } catch (error) {
        console.error("Error fetching order:", error)
        toast.error("Error", {
          description: "Failed to load order details",
        })
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchOrder()
    }
  }, [id, toast])

  const updateOrderStatus = async () => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          paymentStatus: paymentStatus,
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success("Success", {
          description: "Order status updated successfully",
        })
        // Update the local order state with the new status
        setOrder((prev) => ({
          ...(prev as Order),
          status: "confirmed",
          paymentStatus: "paid",
        }))
      } else {
        toast.error("Error", {
          description: data.message || "Failed to update order status",
        })
      }
    } catch (error) {
      console.error("Error updating order status:", error)
      toast.error("Error", {
        description: "Failed to update order status",
      })
    } finally {
      setUpdating(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold">Order not found</h1>
        <Button className="mt-4" onClick={() => router.push("/admin/orders")}>
          Back to Orders
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Order Details</h1>
        <Button onClick={() => router.push("/admin/orders")}>Back to Orders</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Order #{order.id.substring(0, 8)}</CardTitle>
            <CardDescription>Placed on {formatDate(order.created_at)}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">Current Status</h3>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status?.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">Payment Status</h3>
                  <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                    {order.paymentStatus?.charAt(0).toUpperCase() + order?.paymentStatus.slice(1)}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">Total Amount</h3>
                  <p className="font-medium">{formatCurrency(Number(order?.totalAmount))}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Order Items</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order?.orderItems?.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.product?.name || "Product"}</TableCell>
                        <TableCell className="text-right">{formatCurrency(Number(item.price))}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(Number(item.price) * item.quantity)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">Name</h3>
                  <p>{order.user?.name || "N/A"}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">Email</h3>
                  <p>{order.user?.email || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              {order.shipping ? (
                <div className="space-y-2">
                  <p>{order.shippingAddress?.fullName}</p>
                  <p>{order.shippingAddress?.street}</p>
                  <p>
                    {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
                  </p>
                  <p>{order.shippingAddress?.country}</p>
                  <p>Phone: {order.shippingAddress?.phone}</p>
                </div>
              ) : (
                <p>No shipping information available</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Update Order</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="font-medium">Order Status</label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="canceled">Canceled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="font-medium">Payment Status</label>
                  <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full"
                  onClick={updateOrderStatus}
                  disabled={updating || (status === order.status && paymentStatus === order.paymentStatus)}
                >
                  {updating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Order"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
