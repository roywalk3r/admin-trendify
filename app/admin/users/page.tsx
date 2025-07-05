"use client"

import type React from "react"

import { useState } from "react"
import { Search, Filter, MoreHorizontal, Edit, UserCog, ArrowUpDown, Shield, User } from "lucide-react"
import { useApi, useApiMutation } from "@/lib/hooks/use-api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export default function AdminUsersPage() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [role, setRole] = useState("")

  // Fetch users
  const { data, isLoading, refetch } = useApi<any>(`/api/admin/users?page=${page}&search=${search}`)

  // Update user mutation
  const { mutate: updateUser, isLoading: isUpdating } = useApiMutation(`/api/admin/users`, "PATCH", {
    onSuccess: () => {
      toast.success("User role updated successfully")
      refetch()
      setEditingUser(null)
    },
    onError: (error) => {
      toast.error(`Error updating user: ${error}`)
      console.error("Update error:", error)
    },
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    refetch()
  }

  const handleUpdateUser = () => {
    if (editingUser && role) {
      console.log("Updating user with role:", role)
      updateUser({
        id: editingUser.id,
        role: role.toLowerCase(), // Ensure role is lowercase to match schema
      })
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "destructive"
      case "staff":
        return "default"
      default:
        return "outline"
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return <Shield className="h-4 w-4 mr-1" />
      case "staff":
        return <UserCog className="h-4 w-4 mr-1" />
      default:
        return <User className="h-4 w-4 mr-1" />
    }
  }

  const users = data?.users || []
  const pagination = data?.pagination || { total: 0, pages: 1 }
  console.log(data)
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
      </div>

      <div className="flex items-center justify-between">
        <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="search"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button type="submit">
            <Search className="h-4 w-4" />
          </Button>
        </form>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <div className="flex items-center space-x-1">
                      <span>Name</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user: any) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name || "N/A"}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)} className="flex w-fit items-center">
                          {getRoleIcon(user.role)}
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{user._count?.orders || 0}</TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingUser(user)
                                setRole(user.role)
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Role
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <UserCog className="mr-2 h-4 w-4" />
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

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious onClick={() => setPage(page > 1 ? page - 1 : 1)} disabled={page <= 1} />
              </PaginationItem>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === pagination.pages || (p >= page - 1 && p <= page + 1))
                .map((p) => (
                  <PaginationItem key={p}>
                    <PaginationLink isActive={page === p} onClick={() => setPage(p)} size={"sm"}>
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage(page < pagination.pages ? page + 1 : pagination.pages)}
                  disabled={page >= pagination.pages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </>
      )}

      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
            <DialogDescription>Change the role for {editingUser?.name || editingUser?.email}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="STAFF">Staff</SelectItem>
                  <SelectItem value="CUSTOMER">Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUser} disabled={isUpdating}>
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
