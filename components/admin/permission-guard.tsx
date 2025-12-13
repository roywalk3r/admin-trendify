"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { UserRole, Permission, canAccessAdminSection } from "@/lib/auth/permissions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  AlertTriangle, 
  Lock, 
  ShoppingBag, 
  Users, 
  Package, 
  BarChart3, 
  Settings, 
  MessageSquare, 
  Star, 
  FileText,
  Shield,
  Wrench
} from "lucide-react"

interface AdminSection {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  href: string
  requiredPermissions: Permission[]
}

const adminSections: AdminSection[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'Overview and analytics',
    icon: <BarChart3 className="w-5 h-5" />,
    href: '/admin',
    requiredPermissions: [Permission.ANALYTICS_READ]
  },
  {
    id: 'products',
    title: 'Products',
    description: 'Manage products and inventory',
    icon: <Package className="w-5 h-5" />,
    href: '/admin/products',
    requiredPermissions: [Permission.PRODUCT_READ]
  },
  {
    id: 'categories',
    title: 'Categories',
    description: 'Organize product categories',
    icon: <ShoppingBag className="w-5 h-5" />,
    href: '/admin/categories',
    requiredPermissions: [Permission.CATEGORY_READ]
  },
  {
    id: 'orders',
    title: 'Orders',
    description: 'Process and manage orders',
    icon: <FileText className="w-5 h-5" />,
    href: '/admin/orders',
    requiredPermissions: [Permission.ORDER_READ]
  },
  {
    id: 'users',
    title: 'Users',
    description: 'Manage customer accounts',
    icon: <Users className="w-5 h-5" />,
    href: '/admin/users',
    requiredPermissions: [Permission.USER_READ]
  },
  {
    id: 'reviews',
    title: 'Reviews',
    description: 'Moderate customer reviews',
    icon: <Star className="w-5 h-5" />,
    href: '/admin/reviews',
    requiredPermissions: [Permission.REVIEW_READ]
  },
  {
    id: 'support',
    title: 'Support',
    description: 'Handle customer support',
    icon: <MessageSquare className="w-5 h-5" />,
    href: '/admin/support',
    requiredPermissions: [Permission.SUPPORT_READ]
  },
  {
    id: 'content',
    title: 'Content',
    description: 'Manage site content',
    icon: <FileText className="w-5 h-5" />,
    href: '/admin/content',
    requiredPermissions: [Permission.CONTENT_READ]
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'System configuration',
    icon: <Settings className="w-5 h-5" />,
    href: '/admin/settings',
    requiredPermissions: [Permission.SETTINGS_READ]
  },
  {
    id: 'system',
    title: 'System',
    description: 'System maintenance and logs',
    icon: <Wrench className="w-5 h-5" />,
    href: '/admin/system',
    requiredPermissions: [Permission.SYSTEM_LOGS]
  }
]

interface PermissionGuardProps {
  children: React.ReactNode
  requiredPermissions: Permission[]
  fallback?: React.ReactNode
}

export function PermissionGuard({ 
  children, 
  requiredPermissions, 
  fallback 
}: PermissionGuardProps) {
  const { user, isLoaded } = useUser()
  const [userRole, setUserRole] = useState<UserRole>(UserRole.CUSTOMER)
  const [hasPermission, setHasPermission] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isLoaded) return

    const checkPermissions = async () => {
      try {
        // Get user role from Clerk metadata or public metadata
        const role = user?.publicMetadata?.role as UserRole || UserRole.CUSTOMER
        setUserRole(role)

        // Check if user has any of the required permissions
        const hasAny = requiredPermissions.some(permission => 
          canAccessAdminSection(role, permission.split(':')[0])
        )
        setHasPermission(hasAny)
      } catch (error) {
        console.error('Permission check failed:', error)
        setHasPermission(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkPermissions()
  }, [user, isLoaded, requiredPermissions])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!hasPermission) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="text-2xl">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access this area.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Your current role: <Badge variant="secondary">{userRole}</Badge>
              </AlertDescription>
            </Alert>
            <Button onClick={() => window.history.back()} className="w-full">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}

interface AdminNavigationProps {
  currentSection?: string
}

export function AdminNavigation({ currentSection }: AdminNavigationProps) {
  const { user, isLoaded } = useUser()
  const [userRole, setUserRole] = useState<UserRole>(UserRole.CUSTOMER)
  const [accessibleSections, setAccessibleSections] = useState<AdminSection[]>([])

  useEffect(() => {
    if (!isLoaded) return

    const loadAccessibleSections = async () => {
      try {
        const role = user?.publicMetadata?.role as UserRole || UserRole.CUSTOMER
        setUserRole(role)

        const accessible = adminSections.filter(section => 
          canAccessAdminSection(role, section.id)
        )
        setAccessibleSections(accessible)
      } catch (error) {
        console.error('Failed to load admin sections:', error)
      }
    }

    loadAccessibleSections()
  }, [user, isLoaded])

  return (
    <nav className="space-y-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Admin Panel</h2>
        <Badge variant="outline" className="flex items-center gap-1">
          <Shield className="w-3 h-3" />
          {userRole}
        </Badge>
      </div>
      
      <div className="grid gap-2">
        {accessibleSections.map((section) => (
          <Button
            key={section.id}
            variant={currentSection === section.id ? "default" : "ghost"}
            className="justify-start h-auto p-3"
            asChild
          >
            <a href={section.href}>
              <div className="flex items-center gap-3 w-full">
                {section.icon}
                <div className="text-left">
                  <div className="font-medium">{section.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {section.description}
                  </div>
                </div>
              </div>
            </a>
          </Button>
        ))}
      </div>
    </nav>
  )
}

export function useAdminPermissions() {
  const { user, isLoaded } = useUser()
  const [userRole, setUserRole] = useState<UserRole>(UserRole.CUSTOMER)
  const [permissions, setPermissions] = useState<Permission[]>([])

  useEffect(() => {
    if (!isLoaded) return

    const loadPermissions = async () => {
      try {
        const role = user?.publicMetadata?.role as UserRole || UserRole.CUSTOMER
        setUserRole(role)
        setPermissions([]) // Would load actual permissions from API
      } catch (error) {
        console.error('Failed to load permissions:', error)
      }
    }

    loadPermissions()
  }, [user, isLoaded])

  const hasPermission = (permission: Permission) => {
    return canAccessAdminSection(userRole, permission.split(':')[0])
  }

  const canAccessSection = (sectionId: string) => {
    return canAccessAdminSection(userRole, sectionId)
  }

  return {
    userRole,
    permissions,
    hasPermission,
    canAccessSection,
    isLoaded
  }
}
