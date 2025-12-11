import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ThemeProvider } from 'next-themes'

/**
 * Custom render function with providers
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  theme?: 'light' | 'dark'
}

export function renderWithProviders(
  ui: ReactElement<any>,
  options?: CustomRenderOptions
) {
  const { theme = 'light', ...renderOptions } = options || {}

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <ThemeProvider attribute="class" defaultTheme={theme}>
        {children}
      </ThemeProvider>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

/**
 * Wait for async operations
 */
export const waitFor = async (ms: number = 100) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Mock fetch response
 */
export function mockFetchSuccess(data: any) {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: async () => data,
      text: async () => JSON.stringify(data),
    } as Response)
  )
}

export function mockFetchError(status: number = 500, message: string = 'Server error') {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: false,
      status,
      json: async () => ({ error: message }),
      text: async () => message,
    } as Response)
  )
}

/**
 * Create mock product
 */
export function createMockProduct(overrides?: any) {
  return {
    id: 'prod_' + Math.random().toString(36).substr(2, 9),
    name: 'Test Product',
    slug: 'test-product',
    description: 'Test product description',
    price: 99.99,
    originalPrice: null,
    images: ['image1.jpg'],
    category: 'Electronics',
    stock: 10,
    rating: 4.5,
    reviewCount: 10,
    featured: false,
    tags: ['test'],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

/**
 * Create mock user
 */
export function createMockUser(overrides?: any) {
  return {
    id: 'user_' + Math.random().toString(36).substr(2, 9),
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    imageUrl: 'avatar.jpg',
    role: 'CUSTOMER',
    createdAt: new Date(),
    ...overrides,
  }
}

/**
 * Create mock order
 */
export function createMockOrder(overrides?: any) {
  return {
    id: 'order_' + Math.random().toString(36).substr(2, 9),
    userId: 'user123',
    status: 'PENDING',
    paymentStatus: 'PENDING',
    total: 199.99,
    subtotal: 179.99,
    shippingCost: 20.00,
    tax: 0,
    discount: 0,
    items: [],
    shippingAddress: createMockAddress(),
    createdAt: new Date(),
    ...overrides,
  }
}

/**
 * Create mock address
 */
export function createMockAddress(overrides?: any) {
  return {
    id: 'addr_' + Math.random().toString(36).substr(2, 9),
    userId: 'user123',
    fullName: 'John Doe',
    street: '123 Main Street',
    city: 'Accra',
    state: 'GA',
    zipCode: '00000',
    country: 'GH',
    phone: '+233123456789',
    isDefault: false,
    ...overrides,
  }
}

/**
 * Create mock cart item
 */
export function createMockCartItem(overrides?: any) {
  return {
    id: 'item_' + Math.random().toString(36).substr(2, 9),
    cartId: 'cart123',
    productId: 'prod123',
    quantity: 1,
    product: createMockProduct(),
    ...overrides,
  }
}

/**
 * Create mock review
 */
export function createMockReview(overrides?: any) {
  return {
    id: 'rev_' + Math.random().toString(36).substr(2, 9),
    productId: 'prod123',
    userId: 'user123',
    rating: 5,
    comment: 'Great product!',
    verified: false,
    helpful: 0,
    createdAt: new Date(),
    user: createMockUser(),
    ...overrides,
  }
}

/**
 * Create mock coupon
 */
export function createMockCoupon(overrides?: any) {
  return {
    id: 'coupon_' + Math.random().toString(36).substr(2, 9),
    code: 'SAVE10',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    isActive: true,
    expiresAt: new Date(Date.now() + 86400000),
    maxUses: 100,
    usedCount: 0,
    minPurchase: 0,
    ...overrides,
  }
}

/**
 * Simulate user typing
 */
export async function typeText(element: HTMLElement, text: string) {
  for (const char of text) {
    element.focus()
    ;(element as HTMLInputElement).value += char
    element.dispatchEvent(new Event('input', { bubbles: true }))
    await waitFor(10)
  }
}

/**
 * Get form data from form element
 */
export function getFormData(form: HTMLFormElement): Record<string, string> {
  const formData = new FormData(form)
  const data: Record<string, string> = {}
  formData.forEach((value, key) => {
    data[key] = value.toString()
  })
  return data
}

/**
 * Mock localStorage
 */
export function mockLocalStorage() {
  const store: Record<string, string> = {}
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key])
    }),
  }
}

/**
 * Mock sessionStorage
 */
export function mockSessionStorage() {
  return mockLocalStorage()
}

/**
 * Create API error response
 */
export function createApiError(status: number, message: string) {
  return {
    status,
    error: message,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Create API success response
 */
export function createApiSuccess<T>(data: T, meta?: any) {
  return {
    success: true,
    data,
    meta,
  }
}

// Re-export everything from testing library
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
