# Trendify - Testing & CI/CD Strategy

**Timeline:** Week 5-6 (after core features)  
**Priority:** 🔴 CRITICAL - Cannot launch without tests  
**Coverage Target:** 80%+

---

## Overview

This document outlines the testing strategy and CI/CD pipeline setup for Trendify. A production e-commerce platform must have comprehensive automated testing to ensure reliability and prevent regressions.

---

## Testing Stack

```bash
# Install all testing dependencies
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D @playwright/test
npm install -D msw
npm install -D @faker-js/faker
npm install -D c8 # For coverage
```

### Tools

| Tool | Purpose | Config File |
|------|---------|-------------|
| **Vitest** | Unit & Integration tests | `vitest.config.ts` |
| **Playwright** | E2E tests | `playwright.config.ts` |
| **Testing Library** | React component testing | N/A |
| **MSW** | API mocking | `/tests/mocks/` |
| **Faker** | Test data generation | N/A |

---

## 1. Unit Tests (Vitest)

### Configuration

**File:** `/vitest.config.ts` (NEW)
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/*',
      ],
      threshold: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

**File:** `/tests/setup.ts` (NEW)
```typescript
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest matchers
expect.extend(matchers)

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/';
  },
}))

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  auth: vi.fn(() => ({ userId: 'test-user-id' })),
  currentUser: vi.fn(() => ({ id: 'test-user-id', email: 'test@example.com' })),
}))
```

### Example Unit Tests

**File:** `/tests/lib/utils.test.ts` (NEW)
```typescript
import { describe, it, expect } from 'vitest'
import { formatPrice, calculateDiscount, generateSlug } from '@/lib/utils'

describe('Utils', () => {
  describe('formatPrice', () => {
    it('should format price correctly', () => {
      expect(formatPrice(1234.56)).toBe('$1,234.56')
      expect(formatPrice(0)).toBe('$0.00')
      expect(formatPrice(999.9)).toBe('$999.90')
    })
  })

  describe('calculateDiscount', () => {
    it('should calculate percentage discount', () => {
      expect(calculateDiscount(100, 10, 'percentage')).toBe(90)
      expect(calculateDiscount(50, 20, 'percentage')).toBe(40)
    })

    it('should calculate fixed discount', () => {
      expect(calculateDiscount(100, 10, 'fixed')).toBe(90)
      expect(calculateDiscount(50, 60, 'fixed')).toBe(0) // Can't go negative
    })
  })

  describe('generateSlug', () => {
    it('should generate valid slugs', () => {
      expect(generateSlug('Hello World')).toBe('hello-world')
      expect(generateSlug('Product Name 123')).toBe('product-name-123')
      expect(generateSlug('Test@#$%')).toBe('test')
    })
  })
})
```

**File:** `/tests/lib/cart.test.ts` (NEW)
```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore } from '@/lib/store/cart-store'

describe('Cart Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useCartStore.setState({ items: [] })
  })

  it('should add item to cart', () => {
    const { addItem } = useCartStore.getState()
    
    addItem({
      productId: '1',
      name: 'Test Product',
      price: 99.99,
      quantity: 1,
      image: '/test.jpg',
    })

    const { items } = useCartStore.getState()
    expect(items).toHaveLength(1)
    expect(items[0].productId).toBe('1')
  })

  it('should increment quantity if item exists', () => {
    const { addItem } = useCartStore.getState()
    
    addItem({
      productId: '1',
      name: 'Test Product',
      price: 99.99,
      quantity: 1,
      image: '/test.jpg',
    })
    
    addItem({
      productId: '1',
      name: 'Test Product',
      price: 99.99,
      quantity: 1,
      image: '/test.jpg',
    })

    const { items } = useCartStore.getState()
    expect(items).toHaveLength(1)
    expect(items[0].quantity).toBe(2)
  })

  it('should calculate total correctly', () => {
    const { addItem, getTotal } = useCartStore.getState()
    
    addItem({ productId: '1', name: 'Product 1', price: 10, quantity: 2, image: '/test.jpg' })
    addItem({ productId: '2', name: 'Product 2', price: 15, quantity: 1, image: '/test.jpg' })

    expect(getTotal()).toBe(35) // (10 * 2) + 15
  })
})
```

### API Route Tests

**File:** `/tests/api/products.test.ts` (NEW)
```typescript
import { describe, it, expect, vi } from 'vitest'
import { GET, POST } from '@/app/api/products/route'
import { NextRequest } from 'next/server'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  default: {
    product: {
      findMany: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
    },
  },
}))

describe('/api/products', () => {
  describe('GET', () => {
    it('should return products with pagination', async () => {
      const mockProducts = [
        { id: '1', name: 'Product 1', price: 10 },
        { id: '2', name: 'Product 2', price: 20 },
      ]

      vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts)
      vi.mocked(prisma.product.count).mockResolvedValue(2)

      const req = new NextRequest('http://localhost:3000/api/products?page=1&limit=10')
      const response = await GET(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.products).toHaveLength(2)
      expect(data.data.pagination.total).toBe(2)
    })

    it('should handle search queries', async () => {
      const req = new NextRequest('http://localhost:3000/api/products?search=test')
      await GET(req)

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ name: { contains: 'test' } }),
            ]),
          }),
        })
      )
    })
  })

  describe('POST', () => {
    it('should create product with valid data', async () => {
      vi.mocked(prisma.product.create).mockResolvedValue({
        id: '1',
        name: 'New Product',
        price: 99.99,
      })

      const req = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Product',
          slug: 'new-product',
          description: 'Test description',
          price: 99.99,
          stock: 10,
          categoryId: 'cat-1',
          images: ['https://example.com/image.jpg'],
        }),
      })

      const response = await POST(req)
      expect(response.status).toBe(201)
    })

    it('should reject invalid data', async () => {
      const req = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify({
          name: 'X', // Too short
        }),
      })

      const response = await POST(req)
      expect(response.status).toBe(400)
    })
  })
})
```

---

## 2. Component Tests

**File:** `/tests/components/product-card.test.tsx` (NEW)
```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ProductCard } from '@/components/product-card'

describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    slug: 'test-product',
    price: 99.99,
    comparePrice: 129.99,
    images: ['/test.jpg'],
    stock: 10,
    averageRating: 4.5,
    reviewCount: 100,
  }

  it('should render product information', () => {
    render(<ProductCard product={mockProduct} />)

    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('$99.99')).toBeInTheDocument()
    expect(screen.getByText('$129.99')).toBeInTheDocument()
  })

  it('should show discount badge', () => {
    render(<ProductCard product={mockProduct} />)

    expect(screen.getByText(/23% OFF/i)).toBeInTheDocument()
  })

  it('should call onAddToCart when button clicked', () => {
    const onAddToCart = vi.fn()
    render(<ProductCard product={mockProduct} onAddToCart={onAddToCart} />)

    const addButton = screen.getByRole('button', { name: /add to cart/i })
    fireEvent.click(addButton)

    expect(onAddToCart).toHaveBeenCalledWith(mockProduct)
  })

  it('should show out of stock message', () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 }
    render(<ProductCard product={outOfStockProduct} />)

    expect(screen.getByText(/out of stock/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /notify me/i })).toBeInTheDocument()
  })
})
```

---

## 3. End-to-End Tests (Playwright)

### Configuration

**File:** `/playwright.config.ts` (NEW)
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### Critical E2E Test Flows

**File:** `/tests/e2e/checkout-flow.spec.ts` (NEW)
```typescript
import { test, expect } from '@playwright/test'

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should complete guest checkout', async ({ page }) => {
    // 1. Browse products
    await page.click('text=Shop Now')
    await expect(page).toHaveURL(/\/products/)

    // 2. Add product to cart
    const productCard = page.locator('[data-testid="product-card"]').first()
    await productCard.locator('button:has-text("Add to Cart")').click()
    
    // 3. View cart
    await page.click('[data-testid="cart-button"]')
    await expect(page.locator('[data-testid="cart-item"]')).toBeVisible()

    // 4. Proceed to checkout
    await page.click('text=Checkout')
    await expect(page).toHaveURL(/\/checkout/)

    // 5. Choose guest checkout
    await page.click('text=Checkout as Guest')

    // 6. Fill shipping information
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="fullName"]', 'John Doe')
    await page.fill('input[name="street"]', '123 Main St')
    await page.fill('input[name="city"]', 'New York')
    await page.fill('input[name="state"]', 'NY')
    await page.fill('input[name="zipCode"]', '10001')
    await page.fill('input[name="phone"]', '5555555555')

    // 7. Continue to payment
    await page.click('text=Continue to Payment')

    // 8. Verify order summary
    await expect(page.locator('[data-testid="order-summary"]')).toBeVisible()
    
    // 9. Complete order (mock payment)
    await page.click('text=Place Order')

    // 10. Verify success
    await expect(page).toHaveURL(/\/checkout\/success/)
    await expect(page.locator('text=Order confirmed')).toBeVisible()
  })

  test('should show validation errors', async ({ page }) => {
    await page.goto('/checkout')
    await page.click('text=Continue to Payment')

    // Should show validation errors
    await expect(page.locator('text=Email is required')).toBeVisible()
    await expect(page.locator('text=Name is required')).toBeVisible()
  })
})
```

**File:** `/tests/e2e/product-search.spec.ts` (NEW)
```typescript
import { test, expect } from '@playwright/test'

test.describe('Product Search', () => {
  test('should search and filter products', async ({ page }) => {
    await page.goto('/')

    // 1. Search for product
    await page.fill('input[placeholder*="Search"]', 'shirt')
    await page.press('input[placeholder*="Search"]', 'Enter')

    // 2. Verify search results
    await expect(page).toHaveURL(/search=shirt/)
    await expect(page.locator('[data-testid="product-card"]')).toHaveCount(
      await page.locator('[data-testid="product-card"]').count()
    )

    // 3. Apply price filter
    await page.click('text=Price')
    await page.fill('input[name="minPrice"]', '20')
    await page.fill('input[name="maxPrice"]', '100')
    await page.click('text=Apply')

    // 4. Verify filtered results
    const prices = await page.locator('[data-testid="product-price"]').allTextContents()
    prices.forEach(priceText => {
      const price = parseFloat(priceText.replace('$', ''))
      expect(price).toBeGreaterThanOrEqual(20)
      expect(price).toBeLessThanOrEqual(100)
    })

    // 5. Sort by price
    await page.selectOption('select[name="sort"]', 'price-asc')
    await page.waitForLoadState('networkidle')

    // 6. Verify sorting
    const sortedPrices = await page.locator('[data-testid="product-price"]').allTextContents()
    const numericPrices = sortedPrices.map(p => parseFloat(p.replace('$', '')))
    expect(numericPrices).toEqual([...numericPrices].sort((a, b) => a - b))
  })
})
```

---

## 4. API Integration Tests

**File:** `/tests/api/integration/orders.test.ts` (NEW)
```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

describe('Order API Integration', () => {
  let testUserId: string
  let testProductId: string

  beforeAll(async () => {
    // Create test data
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        clerkId: 'test-clerk-id',
      },
    })
    testUserId = user.id

    const product = await prisma.product.create({
      data: {
        name: 'Test Product',
        slug: 'test-product',
        description: 'Test description',
        price: 99.99,
        stock: 10,
        categoryId: 'test-category',
        images: ['/test.jpg'],
      },
    })
    testProductId = product.id
  })

  afterAll(async () => {
    // Cleanup
    await prisma.order.deleteMany({ where: { userId: testUserId } })
    await prisma.product.delete({ where: { id: testProductId } })
    await prisma.user.delete({ where: { id: testUserId } })
    await prisma.$disconnect()
  })

  it('should create order with items', async () => {
    const order = await prisma.order.create({
      data: {
        userId: testUserId,
        orderNumber: `TEST-${Date.now()}`,
        status: 'pending',
        totalAmount: 99.99,
        subtotal: 99.99,
        tax: 0,
        shipping: 0,
        paymentStatus: 'unpaid',
        orderItems: {
          create: [{
            productId: testProductId,
            quantity: 1,
            unitPrice: 99.99,
            totalPrice: 99.99,
            productName: 'Test Product',
          }],
        },
      },
      include: { orderItems: true },
    })

    expect(order.orderItems).toHaveLength(1)
    expect(order.totalAmount).toBe(99.99)
  })
})
```

---

## 5. CI/CD Pipeline

### GitHub Actions

**File:** `.github/workflows/ci.yml` (NEW)
```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run ESLint
        run: npm run lint

  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type check
        run: npx tsc --noEmit

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run Prisma migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
      
      - name: Run unit tests
        run: npm run test:unit -- --coverage
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
          REDIS_URL: redis://localhost:6379
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
      
      - name: Upload Playwright report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/

  build:
    runs-on: ubuntu-latest
    needs: [lint, type-check, test]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
        env:
          SKIP_ENV_VALIDATION: true
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build
          path: .next/
```

### Package.json Scripts

Add to `package.json`:
```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "type-check": "tsc --noEmit"
  }
}
```

---

## Testing Checklist

### Unit Tests (Target: 80% coverage)
- [ ] Utility functions (`/lib/utils.ts`)
- [ ] Cart store (`/lib/store/cart-store.ts`)
- [ ] API utilities (`/lib/api-utils.ts`)
- [ ] Redis helpers (`/lib/redis.ts`)
- [ ] Calculation functions (tax, shipping, discounts)
- [ ] Validation schemas (Zod)
- [ ] Email templates
- [ ] Logger functions

### Component Tests
- [ ] ProductCard
- [ ] CartItem
- [ ] CheckoutForm
- [ ] AddressForm
- [ ] PaymentForm
- [ ] OrderSummary
- [ ] SearchBar
- [ ] Filters

### API Route Tests
- [ ] GET/POST `/api/products`
- [ ] GET/PUT/DELETE `/api/products/[id]`
- [ ] POST `/api/cart`
- [ ] POST `/api/checkout`
- [ ] GET `/api/orders`
- [ ] All admin routes

### E2E Tests (Critical Flows)
- [ ] **Product Browsing:** Search, filter, sort
- [ ] **Guest Checkout:** Complete order without login
- [ ] **User Registration:** Sign up and login
- [ ] **Add to Cart:** Add product, update quantity, remove
- [ ] **Wishlist:** Add/remove products
- [ ] **Checkout:** Complete authenticated checkout
- [ ] **Payment:** Process payment (mock)
- [ ] **Order Tracking:** View order status
- [ ] **Admin:** Create/edit/delete product

---

## Performance Testing

### Load Testing with k6

**Install:**
```bash
brew install k6  # macOS
# or download from https://k6.io
```

**File:** `/tests/load/checkout.js` (NEW)
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 100, // 100 virtual users
  duration: '5m', // Run for 5 minutes
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'], // Error rate must be below 1%
  },
};

export default function () {
  // Test checkout flow
  const res = http.post('http://localhost:3000/api/checkout', {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [{ productId: '1', quantity: 1 }],
      email: 'test@example.com',
    }),
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

**Run:**
```bash
k6 run tests/load/checkout.js
```

---

## Monitoring & Observability

### Application Performance Monitoring

Add to all API routes:
```typescript
import { logger } from '@/lib/logger'

export async function GET(req: NextRequest) {
  const start = Date.now()
  
  try {
    // ... handler logic
    
    const duration = Date.now() - start
    logger.info({ duration, path: req.url }, 'API Request')
    
    return response
  } catch (error) {
    logger.error({ error, path: req.url }, 'API Error')
    throw error
  }
}
```

---

## Pre-Launch Testing Checklist

- [ ] All unit tests passing (80%+ coverage)
- [ ] All E2E tests passing
- [ ] Load testing completed (100+ concurrent users)
- [ ] Mobile responsive testing (iPhone, Android)
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Security testing (OWASP top 10)
- [ ] Accessibility testing (WCAG 2.1)
- [ ] Performance testing (Lighthouse score >90)
- [ ] Payment processing tested (test mode)
- [ ] Email delivery tested
- [ ] Error tracking working (Sentry)
- [ ] Monitoring dashboards configured

---

**Timeline:** 2 weeks  
**Team:** 2 developers + 2 QA engineers  
**Success Criteria:** All tests passing, 80%+ coverage

**Next:** After testing complete, proceed to production deployment
