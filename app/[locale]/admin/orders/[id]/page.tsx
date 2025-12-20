"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, ArrowLeft, Truck, Mail, User2 } from "lucide-react"

interface OrderItem {
  id: string
  productId: string
  quantity: number
  price: string | number
  product?: {
    id: string
    name: string
      price:string
  }
}

interface User {
  id: string
  name?: string
  email: string
}

interface ShippingAddress {
  id: string
  fullName: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
}

interface Order {
  id: string
  userId: string
  status: string
  paymentStatus: string
  totalAmount: string | number
  subtotal: string | number
  tax: string | number
  shipping: string | number
  createdAt: string
  updatedAt: string
  orderItems: OrderItem[]
  user?: User
  shippingAddress?: ShippingAddress
  driver?: { id: string; name: string; phone: string | null }
}

export default function OrderDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [status, setStatus] = useState("")
  const [paymentStatus, setPaymentStatus] = useState("")
  const [trackingNumber, setTrackingNumber] = useState("")
  const [notes, setNotes] = useState("")
  const [drivers, setDrivers] = useState<Array<{ id: string; name: string; phone?: string | null }>>([])
  const [assigning, setAssigning] = useState(false)
  const [selectedDriverId, setSelectedDriverId] = useState<string>("")

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/admin/orders/${id}`)
        const data = await response.json()
        console.log("Order data:", data)

        if (data.data) {
          setOrder(data.data)
          setStatus(data.data.status)
          setPaymentStatus(data.data.paymentStatus)
        } else if (data.success && data.order) {
          setOrder(data.order)
          setStatus(data.order.status)
          setPaymentStatus(data.order.paymentStatus)
        } else {
          toast.error("Failed to load order details")
        }
      } catch (error) {
        console.error("Error fetching order:", error)
        toast.error("Failed to load order details")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchOrder()
    }
  }, [id])

  useEffect(() => {
    // Load active drivers for manual assignment
    const loadDrivers = async () => {
      try {
        const res = await fetch(`/api/admin/drivers?active=true&limit=100`)
        const json = await res.json()
        if (res.ok) {
          setDrivers(json.data?.drivers || [])
        }
      } catch {}
    }
    loadDrivers()
  }, [])

  const updateOrderStatus = async () => {
    if (!order) return

    setUpdating(true)
    try {
      const response = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          trackingNumber: trackingNumber || undefined,
          notes: notes || undefined,
        }),
      })

      const data = await response.json()
      if (response.ok && (data.success || data.data)) {
        toast.success("Order status updated successfully")
        const updated = (data.data || data.order) as any
        setOrder((prev) => ({
          ...(prev as Order),
          ...(updated ? {
            status: updated.status ?? status,
            paymentStatus: updated.paymentStatus ?? paymentStatus,
          } : { status, paymentStatus }),
        }))
      } else {
        toast.error(data.error || data.message || "Failed to update order status")
      }
    } catch (error) {
      console.error("Error updating order status:", error)
      toast.error("Failed to update order status")
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

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "GHC",
    }).format(numAmount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "shipped":
        return "bg-indigo-100 text-indigo-800"
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
      case "partially_refunded":
        return "bg-orange-100 text-orange-800"
      case "failed":
        return "bg-red-100 text-red-800"
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
        <p className="text-muted-foreground mb-4">The order you&apos;re looking for doesn&apos;t exist or has been deleted.</p>
        <Button onClick={() => router.push("/admin/orders")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold leading-tight">Order #{order.id.substring(0, 8)}</h1>
          <p className="text-muted-foreground">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <Button
          className="self-start md:self-auto"
          variant="outline"
          onClick={() => router.push("/admin/orders")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
            <CardDescription>Complete details about this order</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">Order Status</h3>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status?.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">Payment Status</h3>
                  <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                    {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">Total Amount</h3>
                  <p className="font-medium text-lg">{formatCurrency(order.totalAmount)}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="font-semibold mb-1">Order Items</h3>
                {order.orderItems && order.orderItems.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table className="min-w-[600px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead className="text-right">Quantity</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {order.orderItems.map((item: any) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium break-words">
                              {item.product?.name || `Product ${item.productId?.substring(0, 8)}`}
                            </TableCell>
                            <TableCell className="text-right">{formatCurrency(item.product?.price)}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(
                                (typeof item.product?.price === "string" ? Number.parseFloat(item.product?.price) : item.product?.price) *
                                  item.quantity,
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No items found for this order.</p>
                )}
              </div>

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(order.subtotal || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>{formatCurrency(order.tax || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>{formatCurrency(order.shipping || 0)}</span>
                  </div>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(order.totalAmount)}</span>
                </div>
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
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">Name</h3>
                  <p>{order.user?.name || "N/A"}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">Email</h3>
                  <p>{order.user?.email || "N/A"}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">Customer ID</h3>
                  <p className="text-sm text-muted-foreground">{order.userId}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User2 className="h-5 w-5" />
                Driver Assignment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  {order.driver ? (
                    <div>
                      Assigned to: <span className="font-medium text-foreground">{order.driver.name}</span>{order.driver.phone ? ` · ${order.driver.phone}` : ""}
                    </div>
                  ) : (
                    <div>No driver assigned</div>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="driver">Assign Driver</Label>
                  <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
                    <SelectTrigger id="driver"><SelectValue placeholder="Select a driver" /></SelectTrigger>
                    <SelectContent>
                      {drivers.map((d) => (
                        <SelectItem key={d.id} value={d.id}>{d.name}{d.phone ? ` · ${d.phone}` : ""}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="w-full"
                  disabled={!selectedDriverId || assigning}
                  onClick={async () => {
                    if (!selectedDriverId) return
                    setAssigning(true)
                    try {
                      const resp = await fetch(`/api/admin/orders/${id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ driverId: selectedDriverId }),
                      })
                      const data = await resp.json()
                      if (resp.ok && (data.data || data.order)) {
                        const updated = data.data || data.order
                        toast.success("Driver assigned")
                        setOrder((prev) => ({ ...(prev as Order), driver: updated.driver }))
                      } else {
                        toast.error(data.error || "Failed to assign driver")
                      }
                    } catch (e) {
                      toast.error("Failed to assign driver")
                    } finally {
                      setAssigning(false)
                    }
                  }}
                >
                  {assigning ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Assigning...</>) : "Assign Driver"}
                </Button>
                <p className="text-xs text-muted-foreground">Respects service area and daily capacity limits.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              {order.shippingAddress ? (
                <div className="space-y-1">
                  <p className="font-medium">{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.street}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                  <p className="text-sm text-muted-foreground">Phone: {order.shippingAddress.phone}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">No shipping address available</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Update Order Status
              </CardTitle>
              <CardDescription>Update order status and send notification to customer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Order Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="canceled">Canceled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tracking">Tracking Number (Optional)</Label>
                  <Input
                    id="tracking"
                    placeholder="Enter tracking number"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Admin Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add notes about this status update..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={updateOrderStatus}
                  disabled={updating || status === order.status}
                >
                  {updating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Update Status & Notify Customer
                    </>
                  )}
                </Button>
                
                {status !== order.status && (
                  <p className="text-xs text-muted-foreground text-center">
                    Customer will receive an email notification
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Created:</span>
                  <p className="text-muted-foreground">{formatDate(order.createdAt)}</p>
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span>
                  <p className="text-muted-foreground">{formatDate(order.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
