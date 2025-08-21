"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { User, Package, MapPin, Shield, Camera, Edit3 } from "lucide-react"
import { motion } from "framer-motion"
import {SignOutButton, useAuth, UserButton} from "@clerk/nextjs";

interface ProfileData {
  id: string
  name: string
  email: string
  avatar?: string | null
  role: string
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

interface AddressItem {
  id: string
  fullName: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
  isDefault: boolean
  createdAt: string
}

interface OrderItemLite {
  id: string
  productName: string | null
  quantity: number
  unitPrice: string
}

interface PaymentLite {
  status: string
  currency: string
  method: string
}

interface OrderLite {
  id: string
  orderNumber: string
  status: string
  totalAmount: string
  createdAt: string
  payment?: PaymentLite | null
  orderItems?: OrderItemLite[]
}

export default function ProfilePage() {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get("tab") || "overview"

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState<ProfileData | null>(null)
  const [orders, setOrders] = useState<OrderLite[]>([])
  const [name, setName] = useState("")
  const [avatar, setAvatar] = useState("")
  const [addresses, setAddresses] = useState<AddressItem[]>([])
  const [addrLoading, setAddrLoading] = useState(false)
  const [addrSaving, setAddrSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [addrForm, setAddrForm] = useState({
    fullName: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    phone: "",
    isDefault: false,
  })
  const { sessionId } = useAuth()

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/profile", { cache: "no-store" })
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || "Failed to load profile")

        const u: ProfileData = json.data.user
        const os: OrderLite[] = json.data.orders || []
        setData(u)
        setOrders(os)
        setName(u.name || "")
        setAvatar(u.avatar || "")
      } catch (e: any) {
        toast({ title: "Unable to load profile", description: e?.message || String(e), variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const loadAddresses = async () => {
    setAddrLoading(true)
    try {
      const res = await fetch("/api/profile/addresses", { cache: "no-store" })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || "Failed to load addresses")
      setAddresses(json.data || [])
    } catch (e: any) {
      toast({ title: "Could not load addresses", description: e?.message || String(e), variant: "destructive" })
    } finally {
      setAddrLoading(false)
    }
  }

  useEffect(() => {
    if (!loading) {
      loadAddresses()
    }
  }, [loading])

  const onSave = async () => {
    if (!name || name.trim().length < 2) {
      toast({ title: "Name too short", description: "Please enter at least 2 characters", variant: "destructive" })
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), avatar: avatar?.trim?.() || "" }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || "Failed to save profile")
      const u: ProfileData = json.data
      setData(u)
      toast({ title: "Profile updated successfully!" })
    } catch (e: any) {
      toast({ title: "Update failed", description: e?.message || String(e), variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const initials =
      (data?.name || "User")
          .split(" ")
          .map((s) => s[0]?.toUpperCase?.())
          .filter(Boolean)
          .slice(0, 2)
          .join("") || "U"

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "processing":
      case "paid":
        return "bg-ascent text-ascent-foreground"
      case "shipped":
        return "bg-blue-500 text-white"
      case "delivered":
        return "bg-green-500 text-white"
      case "cancelled":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-background to-ascent/5">
        <div className="container mx-auto max-w-6xl py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {/* Profile Header */}
            <div className="mb-8 text-center">
              <div className="relative inline-block">
                <Avatar className="h-24 w-24 ring-4 ring-ascent/20 shadow-lg">
                  <AvatarImage src={avatar || undefined} alt={data?.name || "User"} />
                  <AvatarFallback className="bg-ascent text-ascent-foreground text-2xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <Button
                    size="icon"
                    variant="secondary"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full shadow-md hover:bg-ascent hover:text-ascent-foreground"
                    onClick={() => document.getElementById("avatar-input")?.focus()}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <h1 className="mt-4 text-3xl font-bold text-foreground">{data?.name || "User"}</h1>
              <p className="text-muted-foreground">{data?.email}</p>
              {data?.isVerified && <Badge className="mt-2 bg-green-500 text-white">Verified Account</Badge>}
            </div>

            <Tabs defaultValue={defaultTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-card shadow-sm">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="orders" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Orders
                </TabsTrigger>
                <TabsTrigger value="addresses" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Addresses
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Security
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="border-b bg-gradient-to-r from-ascent/20 to-transparent">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Edit3 className="h-5 w-5 text-ascent" />
                      Profile Information
                    </CardTitle>
                    <CardDescription>Update your personal details and preferences.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ascent"></div>
                        </div>
                    ) : data ? (
                        <>
                          <div className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="name" className="text-sm font-medium">
                                Full Name
                              </Label>
                              <Input
                                  id="name"
                                  placeholder="Enter your full name"
                                  value={name}
                                  onChange={(e) => setName(e.target.value)}
                                  className="focus:ring-ascent focus:border-ascent"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email" className="text-sm font-medium">
                                Email Address
                              </Label>
                              <Input id="email" value={data.email} readOnly className="bg-muted/50 cursor-not-allowed" />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                              <Label htmlFor="avatar" className="text-sm font-medium">
                                Avatar URL
                              </Label>
                              <Input
                                  id="avatar-input"
                                  placeholder="https://example.com/avatar.jpg"
                                  value={avatar}
                                  onChange={(e) => setAvatar(e.target.value)}
                                  className="focus:ring-ascent focus:border-ascent"
                              />
                              <p className="text-xs text-muted-foreground">
                                Paste an image URL or leave blank to use your initials.
                              </p>
                            </div>
                          </div>

                          <Separator />

                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="text-sm font-medium">Account Status</p>
                              <p className="text-xs text-muted-foreground">
                                Member since {new Date(data.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" asChild>
                                <a href="/">Back to Store</a>
                              </Button>
                              <Button
                                  className="bg-ascent text-ascent-foreground hover:bg-ascent/90"
                                  onClick={onSave}
                                  disabled={saving}
                              >
                                {saving ? "Saving..." : "Save Changes"}
                              </Button>
                            </div>
                          </div>
                        </>
                    ) : (
                        <p className="text-center text-destructive py-8">Could not load your profile.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="orders">
                <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="border-b bg-gradient-to-r from-ascent/10 to-transparent">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Package className="h-5 w-5 text-ascent" />
                      Order History
                    </CardTitle>
                    <CardDescription>Track your recent purchases and order status.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    {orders.length === 0 ? (
                        <div className="text-center py-12">
                          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-lg font-medium text-muted-foreground">No orders yet</p>
                          <p className="text-sm text-muted-foreground mb-4">Start shopping to see your orders here</p>
                          <Button asChild className="bg-ascent text-ascent-foreground hover:bg-ascent/90">
                            <a href="/">Browse Products</a>
                          </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted/50">
                                <TableHead className="font-semibold">Order Number</TableHead>
                                <TableHead className="font-semibold">Date</TableHead>
                                <TableHead className="font-semibold">Status</TableHead>
                                <TableHead className="text-right font-semibold">Total</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {orders.map((order) => (
                                  <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                                    <TableCell className="font-medium">#{order.orderNumber}</TableCell>
                                    <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                      <Badge className={getStatusColor(order.status)}>
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                      {new Intl.NumberFormat(undefined, {
                                        style: "currency",
                                        currency: order.payment?.currency || "USD",
                                      }).format(Number(order.totalAmount))}
                                    </TableCell>
                                  </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="addresses">
                <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="border-b bg-gradient-to-r from-ascent/10 to-transparent">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <MapPin className="h-5 w-5 text-ascent" />
                      Shipping Addresses
                    </CardTitle>
                    <CardDescription>Manage your delivery addresses for faster checkout.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Address Form */}
                    <div className="grid gap-4 sm:grid-cols-2 p-4 bg-muted/20 rounded-lg border">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                            id="fullName"
                            value={addrForm.fullName}
                            onChange={(e) => setAddrForm({ ...addrForm, fullName: e.target.value })}
                            className="focus:ring-ascent focus:border-ascent"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                            id="phone"
                            value={addrForm.phone}
                            onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })}
                            className="focus:ring-ascent focus:border-ascent"
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="street">Street Address</Label>
                        <Input
                            id="street"
                            value={addrForm.street}
                            onChange={(e) => setAddrForm({ ...addrForm, street: e.target.value })}
                            className="focus:ring-ascent focus:border-ascent"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                            id="city"
                            value={addrForm.city}
                            onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })}
                            className="focus:ring-ascent focus:border-ascent"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State/Province</Label>
                        <Input
                            id="state"
                            value={addrForm.state}
                            onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })}
                            className="focus:ring-ascent focus:border-ascent"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zip">ZIP/Postal Code</Label>
                        <Input
                            id="zip"
                            value={addrForm.zipCode}
                            onChange={(e) => setAddrForm({ ...addrForm, zipCode: e.target.value })}
                            className="focus:ring-ascent focus:border-ascent"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                            id="country"
                            value={addrForm.country}
                            onChange={(e) => setAddrForm({ ...addrForm, country: e.target.value })}
                            className="focus:ring-ascent focus:border-ascent"
                        />
                      </div>
                      <div className="flex items-center gap-2 sm:col-span-2">
                        <Switch
                            id="isDefault"
                            checked={addrForm.isDefault}
                            onCheckedChange={(v) => setAddrForm({ ...addrForm, isDefault: v })}
                        />
                        <Label htmlFor="isDefault">Set as default address</Label>
                      </div>
                      <div className="flex justify-end gap-2 sm:col-span-2">
                        {editingId && (
                            <Button
                                variant="outline"
                                onClick={() => {
                                  setEditingId(null)
                                  setAddrForm({
                                    fullName: "",
                                    street: "",
                                    city: "",
                                    state: "",
                                    zipCode: "",
                                    country: "",
                                    phone: "",
                                    isDefault: false,
                                  })
                                }}
                            >
                              Cancel
                            </Button>
                        )}
                        <Button
                            className="bg-ascent text-ascent-foreground hover:bg-ascent/90"
                            disabled={addrSaving}
                            onClick={async () => {
                              setAddrSaving(true)
                              try {
                                const payload = { ...addrForm }
                                const res = await fetch(
                                    editingId ? `/api/profile/addresses/${editingId}` : "/api/profile/addresses",
                                    {
                                      method: editingId ? "PUT" : "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify(payload),
                                    },
                                )
                                const json = await res.json()
                                if (!res.ok) throw new Error(json?.error || "Failed to save address")
                                toast({ title: editingId ? "Address updated!" : "Address added!" })
                                setEditingId(null)
                                setAddrForm({
                                  fullName: "",
                                  street: "",
                                  city: "",
                                  state: "",
                                  zipCode: "",
                                  country: "",
                                  phone: "",
                                  isDefault: false,
                                })
                                await loadAddresses()
                              } catch (e: any) {
                                toast({
                                  title: "Save failed",
                                  description: e?.message || String(e),
                                  variant: "destructive",
                                })
                              } finally {
                                setAddrSaving(false)
                              }
                            }}
                        >
                          {addrSaving ? "Saving..." : editingId ? "Update Address" : "Add Address"}
                        </Button>
                      </div>
                    </div>

                    {/* Saved Addresses */}
                    <div>
                      <h3 className="mb-4 text-lg font-semibold">Saved Addresses</h3>
                      {addrLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-ascent"></div>
                          </div>
                      ) : addresses.length === 0 ? (
                          <p className="text-center text-muted-foreground py-8">No addresses saved yet.</p>
                      ) : (
                          <div className="grid gap-4">
                            {addresses.map((address) => (
                                <motion.div
                                    key={address.id}
                                    className="flex items-start justify-between rounded-lg border p-4 bg-card hover:shadow-md transition-all"
                                    whileHover={{ scale: 1.01 }}
                                >
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <p className="font-semibold">{address.fullName}</p>
                                      {address.isDefault && (
                                          <Badge className="bg-ascent text-ascent-foreground">Default</Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-1">{address.street}</p>
                                    <p className="text-sm text-muted-foreground mb-1">
                                      {address.city}, {address.state} {address.zipCode}
                                    </p>
                                    <p className="text-sm text-muted-foreground mb-1">{address.country}</p>
                                    <p className="text-sm text-muted-foreground">{address.phone}</p>
                                  </div>
                                  <div className="flex gap-2">
                                    {!address.isDefault && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={async () => {
                                              try {
                                                const res = await fetch(`/api/profile/addresses/${address.id}`, {
                                                  method: "PUT",
                                                  headers: { "Content-Type": "application/json" },
                                                  body: JSON.stringify({ isDefault: true }),
                                                })
                                                const json = await res.json()
                                                if (!res.ok) throw new Error(json?.error || "Failed to set default")
                                                toast({ title: "Default address updated!" })
                                                await loadAddresses()
                                              } catch (e: any) {
                                                toast({
                                                  title: "Action failed",
                                                  description: e?.message || String(e),
                                                  variant: "destructive",
                                                })
                                              }
                                            }}
                                        >
                                          Set Default
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          setEditingId(address.id)
                                          setAddrForm({
                                            fullName: address.fullName,
                                            street: address.street,
                                            city: address.city,
                                            state: address.state,
                                            zipCode: address.zipCode,
                                            country: address.country,
                                            phone: address.phone,
                                            isDefault: address.isDefault,
                                          })
                                        }}
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={async () => {
                                          if (!confirm("Are you sure you want to delete this address?")) return
                                          try {
                                            const res = await fetch(`/api/profile/addresses/${address.id}`, {
                                              method: "DELETE",
                                            })
                                            const json = await res.json()
                                            if (!res.ok) throw new Error(json?.error || "Failed to delete")
                                            toast({ title: "Address deleted!" })
                                            await loadAddresses()
                                          } catch (e: any) {
                                            toast({
                                              title: "Delete failed",
                                              description: e?.message || String(e),
                                              variant: "destructive",
                                            })
                                          }
                                        }}
                                    >
                                      Delete
                                    </Button>
                                  </div>
                                </motion.div>
                            ))}
                          </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security">
                <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="border-b bg-gradient-to-r from-ascent/10 to-transparent">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Shield className="h-5 w-5 text-ascent" />
                      Security Settings
                    </CardTitle>
                    <CardDescription>Manage your account security and authentication preferences.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 flex flex-col justify-center">
                    <div className="text-center py-8">
                      <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-medium mb-2">Account Security</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Your account security is managed through Clerk. You can update your password, enable two-factor
                        authentication, and manage your sessions through your account settings.
                      </p>

                    <UserButton showName defaultOpen>
                     </UserButton>

                    </div>
                    {/*<SignOutButton>*/}
                    {/*    <Button className={"bg-ascent flex items-center w-fit justify-center text-ascent-foreground hover:bg-ascent/80"}>Sign Out</Button>*/}
                    {/*  </SignOutButton>*/}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
  )
}
