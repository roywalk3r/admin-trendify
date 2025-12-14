import { UserRole, Permission, ROLE_PERMISSIONS } from './permissions'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export class PermissionError extends Error {
  constructor(message: string, public requiredPermission: Permission) {
    super(message)
    this.name = 'PermissionError'
  }
}

function normalizeRole(role: unknown): UserRole {
  if (typeof role !== 'string') return UserRole.CUSTOMER
  const values = Object.values(UserRole) as string[]
  return (values.includes(role) ? (role as UserRole) : UserRole.CUSTOMER)
}

async function getCurrentUserRole(clerkUserId: string, sessionClaimsRole?: unknown): Promise<UserRole> {
  try {
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { role: true },
    })
    if (dbUser?.role) return normalizeRole(dbUser.role)
  } catch {
    // fall through
  }
  return normalizeRole(sessionClaimsRole)
}

/**
 * Check if a user has a specific permission
 */
export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[userRole] || []
  return permissions.includes(permission)
}

/**
 * Check if a user has any of the specified permissions
 */
export function hasAnyPermission(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission))
}

/**
 * Check if a user has all of the specified permissions
 */
export function hasAllPermissions(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission))
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || []
}

/**
 * Check if a role can perform an action on a resource
 */
export function canPerformAction(
  userRole: UserRole, 
  action: string, 
  resource: string
): boolean {
  const permission = `${resource}:${action}` as Permission
  return hasPermission(userRole, permission)
}

/**
 * Middleware function to check permissions
 */
export function requirePermission(permission: Permission) {
  return async (request: Request) => {
    try {
      const { userId, sessionClaims } = await auth()
      
      if (!userId) {
        throw new PermissionError('Authentication required', permission)
      }

      const userRole = await getCurrentUserRole(userId, (sessionClaims as any)?.role)
      
      if (!hasPermission(userRole, permission)) {
        throw new PermissionError(
          `Insufficient permissions. Required: ${permission}`, 
          permission
        )
      }

      return { userId, role: userRole }
    } catch (error) {
      if (error instanceof PermissionError) {
        throw error
      }
      throw new PermissionError('Authentication failed', permission)
    }
  }
}

/**
 * Middleware function to check multiple permissions (any)
 */
export function requireAnyPermission(permissions: Permission[]) {
  return async (request: Request) => {
    try {
      const { userId, sessionClaims } = await auth()
      
      if (!userId) {
        throw new PermissionError('Authentication required', permissions[0])
      }

      const userRole = await getCurrentUserRole(userId, (sessionClaims as any)?.role)
      
      if (!hasAnyPermission(userRole, permissions)) {
        throw new PermissionError(
          `Insufficient permissions. Required any of: ${permissions.join(', ')}`, 
          permissions[0]
        )
      }

      return { userId, role: userRole }
    } catch (error) {
      if (error instanceof PermissionError) {
        throw error
      }
      throw new PermissionError('Authentication failed', permissions[0])
    }
  }
}

/**
 * Middleware function to check multiple permissions (all)
 */
export function requireAllPermissions(permissions: Permission[]) {
  return async (request: Request) => {
    try {
      const { userId, sessionClaims } = await auth()
      
      if (!userId) {
        throw new PermissionError('Authentication required', permissions[0])
      }

      const userRole = await getCurrentUserRole(userId, (sessionClaims as any)?.role)
      
      if (!hasAllPermissions(userRole, permissions)) {
        throw new PermissionError(
          `Insufficient permissions. Required all of: ${permissions.join(', ')}`, 
          permissions[0]
        )
      }

      return { userId, role: userRole }
    } catch (error) {
      if (error instanceof PermissionError) {
        throw error
      }
      throw new PermissionError('Authentication failed', permissions[0])
    }
  }
}

/**
 * Higher-order function for API route handlers with permission checking
 */
export function withPermission<T extends (...args: any[]) => Promise<Response>>(
  permission: Permission,
  handler: T
): T {
  return (async (request: Request, ...args: any[]) => {
    try {
      const authResult = await requirePermission(permission)(request)
      
      // Add auth context to request headers for downstream handlers
      const requestWithAuth = new Request(request.url, {
        method: request.method,
        headers: {
          ...Object.fromEntries(request.headers.entries()),
          'x-user-id': authResult.userId,
          'x-user-role': authResult.role
        },
        body: request.body
      })

      return await handler(requestWithAuth, ...args)
    } catch (error) {
      if (error instanceof PermissionError) {
        return Response.json(
          { 
            error: error.message,
            requiredPermission: error.requiredPermission,
            code: 'INSUFFICIENT_PERMISSIONS'
          },
          { status: 403 }
        )
      }
      
      return Response.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }) as T
}

/**
 * Get user context from request headers (for use in API handlers)
 */
export function getUserFromRequest(request: Request): { userId: string; role: UserRole } | null {
  const userId = request.headers.get('x-user-id')
  const role = request.headers.get('x-user-role') as UserRole

  if (!userId || !role) {
    return null
  }

  return { userId, role }
}

/**
 * Check if current user can access a specific admin section
 */
export function canAccessAdminSection(userRole: UserRole, section: string): boolean {
  const sectionPermissions: Record<string, Permission[]> = {
    'products': [Permission.PRODUCT_READ],
    'categories': [Permission.CATEGORY_READ],
    'orders': [Permission.ORDER_READ],
    'users': [Permission.USER_READ],
    'analytics': [Permission.ANALYTICS_READ],
    'settings': [Permission.SETTINGS_READ],
    'content': [Permission.CONTENT_READ],
    'support': [Permission.SUPPORT_READ],
    'reviews': [Permission.REVIEW_READ],
    'system': [Permission.SYSTEM_LOGS]
  }

  const requiredPermissions = sectionPermissions[section] || []
  return hasAnyPermission(userRole, requiredPermissions)
}
