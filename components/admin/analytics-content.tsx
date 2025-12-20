"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { DollarSign, ShoppingCart, Users, TrendingUp, Package, Eye } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

function formatNumber(num: number) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

export default function AnalyticsContent() {
  const [salesData, setSalesData] = useState<any>(null)
  const [productsData, setProductsData] = useState<any>(null)
  const [customersData, setCustomersData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true)
        const [salesRes, productsRes, customersRes] = await Promise.all([
          fetch('/api/admin/analytics/sales?days=30'),
          fetch('/api/admin/analytics/products?days=30'),
          fetch('/api/admin/analytics/customers?days=30')
        ])

        if (!salesRes.ok || !productsRes.ok || !customersRes.ok) {
          throw new Error('Failed to fetch analytics data')
        }

        const [sales, products, customers] = await Promise.all([
          salesRes.json(),
          productsRes.json(),
          customersRes.json()
        ])

        setSalesData(sales.data)
        setProductsData(products.data)
        setCustomersData(customers.data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()
  }, [])

  if (loading) return <AnalyticsLoading />
  if (error) return <div className="text-red-500">Error: {error}</div>

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(salesData?.summary?.totalRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {salesData?.summary?.revenueGrowth > 0 ? '+' : ''}{salesData?.summary?.revenueGrowth?.toFixed(1)}% from last period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(salesData?.summary?.totalOrders || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Avg Order Value: {formatCurrency(salesData?.summary?.avgOrderValue || 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(customersData?.summary?.activeCustomers || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Retention Rate: {customersData?.summary?.retentionRate || 0}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Product Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(productsData?.summary?.totalViews || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Active Products: {formatNumber(productsData?.summary?.activeProducts || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData?.charts?.timeSeries || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Segments</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={customersData?.charts?.customerSegments || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, count }: any) => `${name}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {(customersData?.charts?.customerSegments || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tables */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salesData?.topProducts?.slice(0, 5).map((product: any, index: number) => (
                <div key={product.productId} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium">#{index + 1}</span>
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.quantitySold} sold</p>
                    </div>
                  </div>
                  <div className="text-sm font-medium">{formatCurrency(product.revenue)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {productsData?.charts?.categoryPerformance?.slice(0, 5).map((category: any, index: number) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{category.category}</p>
                    <p className="text-xs text-muted-foreground">{category.count} products</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatCurrency(category.sales)}</p>
                    <p className="text-xs text-muted-foreground">{category.views} views</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Inventory Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Out of Stock</span>
                <span className="text-sm font-medium text-red-600">{productsData?.summary?.outOfStock || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Low Stock</span>
                <span className="text-sm font-medium text-yellow-600">{productsData?.summary?.lowStock || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Total Products</span>
                <span className="text-sm font-medium">{productsData?.summary?.totalProducts || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">New Customers</span>
                <span className="text-sm font-medium">{customersData?.summary?.newCustomers || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Returning</span>
                <span className="text-sm font-medium">{customersData?.summary?.returningCustomers || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Avg CLV</span>
                <span className="text-sm font-medium">{formatCurrency(customersData?.summary?.customerLifetimeValue || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Ratings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Average Rating</span>
                <span className="text-sm font-medium">{productsData?.summary?.avgRating || 0}/5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Total Items Sold</span>
                <span className="text-sm font-medium">{salesData?.summary?.totalItems || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Guest Orders</span>
                <span className="text-sm font-medium">{customersData?.summary?.guestOrders || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function AnalyticsLoading() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array(4).fill(0).map((_, i) => (
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
      <div className="grid gap-4 md:grid-cols-2">
        {Array(2).fill(0).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
