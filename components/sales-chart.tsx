"use client"

import { useEffect, useState } from "react"
import { useApi } from "@/lib/hooks/use-api"
import { Skeleton } from "@/components/ui/skeleton"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

export default function AdminSalesChart() {
  const { data, isLoading } = useApi<any>("/api/admin/dashboard")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || isLoading) {
    return <Skeleton className="h-[300px] w-full" />
  }

  const salesByMonth = data?.salesByMonth || []

  // Format data for chart
  const chartData = salesByMonth
    .map((item: any) => ({
      name: new Date(item.month).toLocaleDateString("en-US", { month: "short" }),
      revenue: Number.parseFloat(item.revenue),
      orders: Number.parseInt(item.orders),
    }))
    .reverse()

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <XAxis dataKey="name" />
        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
        <Tooltip />
        <CartesianGrid strokeDasharray="3 3" />
        <Bar yAxisId="left" dataKey="revenue" fill="#8884d8" name="Revenue ($)" />
        <Bar yAxisId="right" dataKey="orders" fill="#82ca9d" name="Orders" />
      </BarChart>
    </ResponsiveContainer>
  )
}
