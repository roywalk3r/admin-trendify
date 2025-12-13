"use client"

import { UserRole, Permission, ROLE_PERMISSIONS } from '@/lib/auth/permissions'
import { 
  hasPermission, 
  hasAnyPermission, 
  hasAllPermissions, 
  getRolePermissions, 
  canAccessAdminSection 
} from '@/lib/auth/authorization'
import { useAuth } from '@clerk/nextjs'

/**
 * React hook for client-side permission checking
 */
export function usePermissions() {
  const { userId, sessionClaims } = useAuth()
  
  const userRole = (sessionClaims?.role as UserRole) || UserRole.CUSTOMER
  
  return {
    role: userRole,
    permissions: getRolePermissions(userRole),
    hasPermission: (permission: Permission) => hasPermission(userRole, permission),
    hasAnyPermission: (permissions: Permission[]) => hasAnyPermission(userRole, permissions),
    hasAllPermissions: (permissions: Permission[]) => hasAllPermissions(userRole, permissions),
    canAccessAdminSection: (section: string) => canAccessAdminSection(userRole, section)
  }
}
