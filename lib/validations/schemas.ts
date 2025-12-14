import { z } from 'zod'

// Common validation patterns
const emailSchema = z.string().email('Invalid email address').min(1, 'Email is required')
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
const nameSchema = z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long')
const phoneSchema = z.string().regex(/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/, 'Invalid phone number')

// User authentication schemas
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema.optional(),
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions')
})

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional()
})

export const forgotPasswordSchema = z.object({
  email: emailSchema
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

// Profile management schemas
export const updateProfileSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  phone: phoneSchema.optional(),
  email: emailSchema.optional(),
  avatar: z.string().url('Invalid avatar URL').optional()
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

// Address schemas
export const addressSchema = z.object({
  street: z.string().min(5, 'Street address is required').max(200, 'Street address is too long'),
  city: z.string().min(2, 'City is required').max(100, 'City name is too long'),
  state: z.string().min(2, 'State is required').max(100, 'State name is too long'),
  postalCode: z.string().min(3, 'Postal code is required').max(20, 'Postal code is too long'),
  country: z.string().min(2, 'Country is required').max(100, 'Country name is too long'),
  isDefault: z.boolean().optional()
})

// Product schemas
export const productReviewSchema = z.object({
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  title: z.string().min(5, 'Review title is required').max(200, 'Title is too long'),
  content: z.string().min(10, 'Review content is required').max(2000, 'Review is too long'),
  images: z.array(z.string().url('Invalid image URL')).max(5, 'Maximum 5 images allowed').optional()
})

export const contactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  subject: z.string().min(5, 'Subject is required').max(200, 'Subject is too long'),
  message: z.string().min(20, 'Message is required').max(2000, 'Message is too long'),
  phone: phoneSchema.optional()
})

// Newsletter subscription schema
export const newsletterSchema = z.object({
  email: emailSchema,
  name: z.string().min(2, 'Name is required').max(100, 'Name is too long').optional(),
  preferences: z.object({
    promotions: z.boolean().default(true),
    newProducts: z.boolean().default(true),
    newsletter: z.boolean().default(true)
  }).optional()
})

// Cart and checkout schemas
export const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1').max(99, 'Quantity cannot exceed 99'),
  variantId: z.string().optional(),
  color: z.string().optional(),
  size: z.string().optional()
})

export const updateCartItemSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  quantity: z.number().min(0, 'Quantity must be at least 0').max(99, 'Quantity cannot exceed 99')
})

export const checkoutSchema = z.object({
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  paymentMethod: z.enum(['card', 'paypal', 'bank_transfer'], {
    errorMap: () => ({ message: 'Invalid payment method' })
  }),
  savePaymentMethod: z.boolean().optional(),
  notes: z.string().max(500, 'Order notes are too long').optional()
})

// Payment schemas
export const paymentCardSchema = z.object({
  cardNumber: z.string().regex(/^\d{16}$/, 'Invalid card number'),
  expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, 'Invalid expiry month'),
  expiryYear: z.string().regex(/^\d{2}$/, 'Invalid expiry year'),
  cvv: z.string().regex(/^\d{3,4}$/, 'Invalid CVV'),
  cardholderName: nameSchema,
  saveCard: z.boolean().optional()
})

// Search and filter schemas
export const productSearchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(100, 'Search query is too long'),
  category: z.string().optional(),
  minPrice: z.number().min(0, 'Minimum price cannot be negative').optional(),
  maxPrice: z.number().min(0, 'Maximum price cannot be negative').optional(),
  rating: z.number().min(0).max(5).optional(),
  inStock: z.boolean().optional(),
  onSale: z.boolean().optional(),
  sortBy: z.enum(['name', 'price', 'rating', 'newest', 'popular']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  page: z.number().min(1, 'Page must be at least 1').default(1),
  limit: z.number().min(1, 'Limit must be at least 1').max(50, 'Limit cannot exceed 50').default(20),
  tags: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  sizes: z.array(z.string()).optional()
})

// Admin schemas
export const createProductSchema = z.object({
  name: z.string().min(3, 'Product name is required').max(200, 'Product name is too long'),
  description: z.string().min(10, 'Description is required').max(5000, 'Description is too long'),
  price: z.number().min(0, 'Price must be positive'),
  comparePrice: z.number().min(0, 'Compare price must be positive').optional(),
  sku: z.string().min(3, 'SKU is required').max(50, 'SKU is too long'),
  stock: z.number().min(0, 'Stock cannot be negative').default(0),
  categoryId: z.string().min(1, 'Category is required'),
  images: z.array(z.string().url('Invalid image URL')).min(1, 'At least one image is required'),
  tags: z.array(z.string()).optional(),
  variants: z.array(z.object({
    name: z.string().min(1, 'Variant name is required'),
    price: z.number().min(0, 'Variant price must be positive'),
    stock: z.number().min(0, 'Variant stock cannot be negative'),
    attributes: z.record(z.string()).optional()
  })).optional(),
  seoTitle: z.string().max(60, 'SEO title is too long').optional(),
  seoDescription: z.string().max(160, 'SEO description is too long').optional(),
  weight: z.number().min(0, 'Weight cannot be negative').optional(),
  dimensions: z.object({
    length: z.number().min(0, 'Length cannot be negative'),
    width: z.number().min(0, 'Width cannot be negative'),
    height: z.number().min(0, 'Height cannot be negative')
  }).optional()
})

export const updateProductSchema = createProductSchema.partial()

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Category name is required').max(100, 'Category name is too long'),
  slug: z.string().min(2, 'Slug is required').max(100, 'Slug is too long').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().max(500, 'Description is too long').optional(),
  image: z.string().url('Invalid image URL').optional(),
  parentId: z.string().optional()
})

// API response schemas
export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional()
})

export const paginatedResponseSchema = z.object({
  data: z.array(z.any()),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean()
  })
})

// Type exports
export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type AddressInput = z.infer<typeof addressSchema>
export type ProductReviewInput = z.infer<typeof productReviewSchema>
export type ContactFormInput = z.infer<typeof contactFormSchema>
export type NewsletterInput = z.infer<typeof newsletterSchema>
export type AddToCartInput = z.infer<typeof addToCartSchema>
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>
export type CheckoutInput = z.infer<typeof checkoutSchema>
export type PaymentCardInput = z.infer<typeof paymentCardSchema>
export type ProductSearchInput = z.infer<typeof productSearchSchema>
export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type CreateCategoryInput = z.infer<typeof createCategorySchema>
