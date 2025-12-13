import { z } from 'zod'

// Role definitions
export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
  MANAGER = 'manager',
  SUPPORT = 'support',
  CONTENT_EDITOR = 'content_editor'
}

// Permission definitions
export enum Permission {
  // Product permissions
  PRODUCT_READ = 'product:read',
  PRODUCT_CREATE = 'product:create',
  PRODUCT_UPDATE = 'product:update',
  PRODUCT_DELETE = 'product:delete',
  PRODUCT_PUBLISH = 'product:publish',
  
  // Category permissions
  CATEGORY_READ = 'category:read',
  CATEGORY_CREATE = 'category:create',
  CATEGORY_UPDATE = 'category:update',
  CATEGORY_DELETE = 'category:delete',
  
  // Order permissions
  ORDER_READ = 'order:read',
  ORDER_UPDATE = 'order:update',
  ORDER_CANCEL = 'order:cancel',
  ORDER_REFUND = 'order:refund',
  
  // User permissions
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  USER_BAN = 'user:ban',
  
  // Analytics permissions
  ANALYTICS_READ = 'analytics:read',
  ANALYTICS_EXPORT = 'analytics:export',
  
  // Settings permissions
  SETTINGS_READ = 'settings:read',
  SETTINGS_UPDATE = 'settings:update',
  
  // Content permissions
  CONTENT_READ = 'content:read',
  CONTENT_CREATE = 'content:create',
  CONTENT_UPDATE = 'content:update',
  CONTENT_DELETE = 'content:delete',
  
  // Support permissions
  SUPPORT_READ = 'support:read',
  SUPPORT_RESPOND = 'support:respond',
  SUPPORT_ESCALATE = 'support:escalate',
  
  // Review permissions
  REVIEW_READ = 'review:read',
  REVIEW_MODERATE = 'review:moderate',
  REVIEW_DELETE = 'review:delete',
  
  // System permissions
  SYSTEM_LOGS = 'system:logs',
  SYSTEM_BACKUP = 'system:backup',
  SYSTEM_MAINTENANCE = 'system:maintenance'
}

// Role-permission mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.CUSTOMER]: [
    Permission.PRODUCT_READ,
    Permission.CATEGORY_READ,
    Permission.ORDER_READ,
    Permission.REVIEW_READ,
    Permission.CONTENT_READ
  ],
  
  [UserRole.CONTENT_EDITOR]: [
    Permission.PRODUCT_READ,
    Permission.PRODUCT_CREATE,
    Permission.PRODUCT_UPDATE,
    Permission.PRODUCT_PUBLISH,
    Permission.CATEGORY_READ,
    Permission.CATEGORY_CREATE,
    Permission.CATEGORY_UPDATE,
    Permission.CONTENT_READ,
    Permission.CONTENT_CREATE,
    Permission.CONTENT_UPDATE,
    Permission.REVIEW_READ,
    Permission.REVIEW_MODERATE
  ],
  
  [UserRole.SUPPORT]: [
    Permission.PRODUCT_READ,
    Permission.CATEGORY_READ,
    Permission.ORDER_READ,
    Permission.ORDER_UPDATE,
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.SUPPORT_READ,
    Permission.SUPPORT_RESPOND,
    Permission.SUPPORT_ESCALATE,
    Permission.REVIEW_READ,
    Permission.REVIEW_MODERATE,
    Permission.ANALYTICS_READ
  ],
  
  [UserRole.MANAGER]: [
    Permission.PRODUCT_READ,
    Permission.PRODUCT_CREATE,
    Permission.PRODUCT_UPDATE,
    Permission.PRODUCT_PUBLISH,
    Permission.CATEGORY_READ,
    Permission.CATEGORY_CREATE,
    Permission.CATEGORY_UPDATE,
    Permission.ORDER_READ,
    Permission.ORDER_UPDATE,
    Permission.ORDER_CANCEL,
    Permission.ORDER_REFUND,
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.USER_BAN,
    Permission.ANALYTICS_READ,
    Permission.ANALYTICS_EXPORT,
    Permission.SETTINGS_READ,
    Permission.CONTENT_READ,
    Permission.CONTENT_CREATE,
    Permission.CONTENT_UPDATE,
    Permission.SUPPORT_READ,
    Permission.SUPPORT_RESPOND,
    Permission.SUPPORT_ESCALATE,
    Permission.REVIEW_READ,
    Permission.REVIEW_MODERATE,
    Permission.REVIEW_DELETE
  ],
  
  [UserRole.ADMIN]: [
    ...Object.values(Permission)
  ],
  
  [UserRole.SUPER_ADMIN]: [
    ...Object.values(Permission),
    Permission.PRODUCT_DELETE,
    Permission.CATEGORY_DELETE,
    Permission.USER_DELETE,
    Permission.SYSTEM_LOGS,
    Permission.SYSTEM_BACKUP,
    Permission.SYSTEM_MAINTENANCE
  ]
}

// Permission groups for easier management
export const PERMISSION_GROUPS = {
  PRODUCTS: [
    Permission.PRODUCT_READ,
    Permission.PRODUCT_CREATE,
    Permission.PRODUCT_UPDATE,
    Permission.PRODUCT_DELETE,
    Permission.PRODUCT_PUBLISH
  ],
  CATEGORIES: [
    Permission.CATEGORY_READ,
    Permission.CATEGORY_CREATE,
    Permission.CATEGORY_UPDATE,
    Permission.CATEGORY_DELETE
  ],
  ORDERS: [
    Permission.ORDER_READ,
    Permission.ORDER_UPDATE,
    Permission.ORDER_CANCEL,
    Permission.ORDER_REFUND
  ],
  USERS: [
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
    Permission.USER_BAN
  ],
  ANALYTICS: [
    Permission.ANALYTICS_READ,
    Permission.ANALYTICS_EXPORT
  ],
  SETTINGS: [
    Permission.SETTINGS_READ,
    Permission.SETTINGS_UPDATE
  ],
  CONTENT: [
    Permission.CONTENT_READ,
    Permission.CONTENT_CREATE,
    Permission.CONTENT_UPDATE,
    Permission.CONTENT_DELETE
  ],
  SUPPORT: [
    Permission.SUPPORT_READ,
    Permission.SUPPORT_RESPOND,
    Permission.SUPPORT_ESCALATE
  ],
  REVIEWS: [
    Permission.REVIEW_READ,
    Permission.REVIEW_MODERATE,
    Permission.REVIEW_DELETE
  ],
  SYSTEM: [
    Permission.SYSTEM_LOGS,
    Permission.SYSTEM_BACKUP,
    Permission.SYSTEM_MAINTENANCE
  ]
}

// Validation schemas
export const roleSchema = z.nativeEnum(UserRole)
export const permissionSchema = z.nativeEnum(Permission)
export const updateRoleSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  role: roleSchema
})

// Type exports
export type Role = UserRole
export type PermissionType = Permission
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>
