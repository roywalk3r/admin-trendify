"use client"

import { useRouter } from "next/navigation"
import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, ShoppingCart, Users, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import AdminDashboardStats from "@/components/admin/dashboard-stats"
import AdminRecentOrders from "@/components/admin/recent-orders"
import AdminTopProducts from "@/components/admin/top-products"
import AdminSalesChart from "@/components/admin/sales-chart"

export default function AdminDashboardPage() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>

      <Suspense fallback={<StatsLoading />}>
        <AdminDashboardStats />
      </Suspense>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => router.push("/admin/products/new")}>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
              <Button variant="outline" onClick={() => router.push("/admin/orders")}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                View Orders
              </Button>
              <Button variant="outline" onClick={() => router.push("/admin/users")}>
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Button>
              <Button variant="outline" onClick={() => router.push("/admin/debug/admin-debug")}>
                <AlertCircle className="mr-2 h-4 w-4" />
                Debug Panel
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Database Connection</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  Connected
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Appwrite Storage</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  Connected
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Clerk Authentication</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  Connected
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Admin Access</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  Granted
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Sales Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
                  <AdminSalesChart />
                </Suspense>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
                  <AdminTopProducts />
                </Suspense>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                <AdminRecentOrders />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Detailed analytics will be available here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Generate and view reports here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatsLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array(4)
        .fill(0)
        .map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-24 mb-1" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
    </div>
  )
}
