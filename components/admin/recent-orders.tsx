"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/lib/hooks/use-api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Package, CreditCard, Eye, MoreVertical } from "lucide-react";
import { useCurrency } from "@/lib/contexts/settings-context";
import MobileAdminTable from "@/components/admin/mobile/mobile-admin-table";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AdminRecentOrders() {
  const { data, isLoading } = useApi<any>("/api/admin/dashboard");
  const [mounted, setMounted] = useState(false);
  const { format } = useCurrency();
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return <OrdersLoading />;
  }

  const recentOrders = data?.recentOrders || [];

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "shipped":
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentBadgeColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const columns = [
    {
      key: "id",
      label: "Order ID",
      render: (value: string) => (
        <span className="font-medium">{value.substring(0, 8)}</span>
      )
    },
    {
      key: "customer",
      label: "Customer",
      render: (value: any, row: any) => (
        <span>{row.user?.name || row.user?.email || "N/A"}</span>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <Badge className={getStatusBadgeColor(value)}>
          <Package className="h-3 w-3 mr-1" />
          {value}
        </Badge>
      )
    },
    {
      key: "paymentStatus",
      label: "Payment",
      render: (value: string) => (
        <Badge className={getPaymentBadgeColor(value)}>
          <CreditCard className="h-3 w-3 mr-1" />
          {value}
        </Badge>
      )
    },
    {
      key: "totalAmount",
      label: "Total",
      render: (value: number) => (
        <span className="font-medium">{format(Number(value ?? 0))}</span>
      )
    },
    {
      key: "createdAt",
      label: "Date",
      render: (value: string) => (
        <span>{new Date(value).toLocaleDateString()}</span>
      )
    }
  ];

  const actions = [
    {
      label: "View Details",
      icon: Eye,
      onClick: (order: any) => {
        // Navigate to order details
        window.location.href = `/admin/orders/${order.id}`;
      }
    }
  ];

  const filters = [
    {
      key: "status",
      label: "Order Status",
      options: [
        { value: "pending", label: "Pending" },
        { value: "processing", label: "Processing" },
        { value: "shipped", label: "Shipped" },
        { value: "delivered", label: "Delivered" },
        { value: "cancelled", label: "Cancelled" }
      ]
    },
    {
      key: "paymentStatus",
      label: "Payment Status",
      options: [
        { value: "pending", label: "Pending" },
        { value: "paid", label: "Paid" },
        { value: "failed", label: "Failed" },
        { value: "refunded", label: "Refunded" }
      ]
    }
  ];

  if (isMobile) {
    return (
      <div className="space-y-4">
        <MobileAdminTable
          data={recentOrders}
          columns={columns}
          actions={actions}
          title="Recent Orders"
          searchPlaceholder="Search orders..."
          filters={filters}
        />
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <Table className="min-w-[900px]">
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[120px]">Order ID</TableHead>
            <TableHead className="min-w-[180px]">Customer</TableHead>
            <TableHead className="min-w-[140px]">Status</TableHead>
            <TableHead className="min-w-[140px]">Payment</TableHead>
            <TableHead className="min-w-[120px]">Total</TableHead>
            <TableHead className="min-w-[160px]">Date</TableHead>
            <TableHead className="min-w-[140px]">Actions</TableHead>
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
                <TableCell className="font-medium">
                  {order.id.substring(0, 8)}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {order.user?.name || order.user?.email || "N/A"}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusBadgeColor(order.status)}>
                    <Package className="h-3 w-3 mr-1" />
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getPaymentBadgeColor(order.paymentStatus)}>
                    <CreditCard className="h-3 w-3 mr-1" />
                    {order.paymentStatus}
                  </Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap">{format(Number(order.totalAmount ?? 0))}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {new Date(order.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => window.location.href = `/admin/orders/${order.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
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
  );
}
