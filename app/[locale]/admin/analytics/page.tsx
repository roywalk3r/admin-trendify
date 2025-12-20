"use client"

import { useState } from "react"
import { useApi } from "@/lib/hooks/use-api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, Users, ShoppingBag, DollarSign } from "lucide-react"
import { useCurrency } from "@/lib/contexts/settings-context"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("month")
  const { data, isLoading } = useApi<any>("/api/admin/dashboard")
  const { format, symbol } = useCurrency()

  // Colors for charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

  // Format data for charts
  const formatSalesData = () => {
    if (!data?.salesByMonth) return []

    return data.salesByMonth
      .map((item: any) => {
        const monthDate = new Date(item.month)
        return {
          name: monthDate.toLocaleDateString("en-US", { month: "short" }),
          revenue: Number.parseFloat(item.revenue),
          orders: Number.parseInt(item.orders),
          monthDate,
        }
      })
      .reverse()
  }

  const formatUserRoleData = () => {
    if (!data?.usersByRole) return []

    return data.usersByRole.map((item: any) => ({
      name: item.role.charAt(0).toUpperCase() + item.role.slice(1).toLowerCase(),
      value: item._count,
    }))
  }

  const formatTopProductsData = () => {
    if (!data?.topProducts) return []

    return data?.topProducts
      .filter((item: any) => item.product)
      .map((item: any) => ({
        name: item.product.name,
        value: item.totalSold,
      }))
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    )
  }

  const salesData = formatSalesData()
  const filteredSalesData = (() => {
    const length = salesData.length
    if (timeRange === "week") return salesData.slice(Math.max(0, length - 1)) // latest point
    if (timeRange === "month") return salesData.slice(Math.max(0, length - 3)) // latest quarter
    return salesData // year (all)
  })()

  const rangeTotals = filteredSalesData.reduce(
    (acc, item) => ({
      revenue: acc.revenue + (item.revenue || 0),
      orders: acc.orders + (item.orders || 0),
    }),
    { revenue: 0, orders: 0 }
  )
  const userRoleData = formatUserRoleData()
  const topProductsData = formatTopProductsData()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <Tabs value={timeRange} onValueChange={setTimeRange}>
            <TabsList>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => (window.location.href = "/api/admin/export?type=orders&format=csv")}>
            Export Orders
          </Button>
          <Button variant="outline" size="sm" onClick={() => (window.location.href = "/api/admin/export?type=revenue&format=csv")}>
            Revenue Report
          </Button>
          <Button variant="outline" size="sm" onClick={() => (window.location.href = "/api/admin/export?type=products&format=csv")}>
            Export Products
          </Button>
          <Button variant="outline" size="sm" onClick={() => (window.location.href = "/api/admin/export?type=customers&format=csv")}>
            Export Customers
          </Button>
          <Button variant="outline" size="sm" onClick={() => (window.location.href = "/api/admin/export?type=low-stock&format=csv")}>
            Low Stock
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{format(rangeTotals.revenue || 0)}</div>
            <p className="text-xs text-muted-foreground">Filtered by {timeRange}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rangeTotals.orders || 0}</div>
            <p className="text-xs text-muted-foreground">Filtered by {timeRange}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.totalUsers && data?.totalOrders
                ? (Number(data.totalOrders / data.totalUsers) * 100).toFixed(1)
                : "0"}
              %
            </div>
            <p className="text-xs text-muted-foreground">+1.2% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue & Orders</CardTitle>
            <CardDescription>Monthly revenue and order count</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              {filteredSalesData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredSalesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip formatter={(value) => [format(Number(value)), "Revenue"]} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="revenue" name={`Revenue (${symbol})`} fill="#8884d8" />
                    <Bar yAxisId="right" dataKey="orders" name="Orders" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No sales data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
            <CardDescription>Users by role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              {userRoleData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userRoleData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent = 0 }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {userRoleData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} users`, "Count"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No user data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
            <CardDescription>Monthly sales trend over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              {filteredSalesData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={filteredSalesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [format(Number(value)), "Revenue"]} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" name={`Revenue (${symbol})`} stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No sales data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Best selling products by quantity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              {topProductsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={topProductsData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={150} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Units Sold" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No product data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
