# E2E Testing Guide for Trendify

## Overview

This guide covers setting up End-to-End (E2E) testing using **Playwright** for comprehensive browser-based testing of Trendify.

## Why E2E Testing?

E2E tests complement unit and integration tests by:
- Testing complete user workflows in a real browser
- Validating UI interactions and visual elements
- Catching integration issues between frontend and backend
- Ensuring critical paths work from a user's perspective

## Setup Playwright

### 1. Install Playwright

```bash
pnpm add -D @playwright/test playwright
```

### 2. Initialize Playwright

```bash
pnpm exec playwright install
```

This installs browser binaries (Chromium, Firefox, WebKit).

### 3. Create Playwright Config

Create `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
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
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

## Writing E2E Tests

### Directory Structure

```
e2e/
├── auth/
│   ├── login.spec.ts
│   └── signup.spec.ts
├── shopping/
│   ├── product-browse.spec.ts
│   ├── search.spec.ts
│   ├── cart.spec.ts
│   └── checkout.spec.ts
├── admin/
│   ├── product-management.spec.ts
│   └── order-management.spec.ts
└── fixtures/
    └── test-data.ts
```

### Example: Product Browse Test

```typescript
// e2e/shopping/product-browse.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Product Browsing', () => {
  test('displays product catalog', async ({ page }) => {
    await page.goto('/')
    
    // Check homepage loads
    await expect(page).toHaveTitle(/Trendify/)
    
    // Navigate to products
    await page.click('text=Shop Now')
    await expect(page).toHaveURL(/\/products/)
    
    // Verify products are displayed
    const productCards = page.locator('[data-testid="product-card"]')
    await expect(productCards).toHaveCount(20) // Default page size
    
    // Check product card content
    const firstProduct = productCards.first()
    await expect(firstProduct.locator('h3')).toBeVisible()
    await expect(firstProduct.locator('[data-testid="price"]')).toBeVisible()
    await expect(firstProduct.locator('img')).toBeVisible()
  })

  test('filters products by category', async ({ page }) => {
    await page.goto('/products')
    
    // Click Electronics category
    await page.click('text=Electronics')
    
    // Verify URL updated
    await expect(page).toHaveURL(/category=electronics/)
    
    // Verify filtered products
    const products = page.locator('[data-testid="product-card"]')
    await expect(products.first()).toContainText('Electronics')
  })

  test('searches for products', async ({ page }) => {
    await page.goto('/')
    
    // Enter search query
    await page.fill('[data-testid="search-input"]', 'laptop')
    await page.press('[data-testid="search-input"]', 'Enter')
    
    // Verify search results
    await expect(page).toHaveURL(/search=laptop/)
    await expect(page.locator('text=Search Results')).toBeVisible()
    
    const results = page.locator('[data-testid="product-card"]')
    await expect(results).toHaveCount(5) // Assume 5 results
  })
})
```

### Example: Shopping Cart Test

```typescript
// e2e/shopping/cart.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Shopping Cart', () => {
  test('adds product to cart', async ({ page }) => {
    await page.goto('/products/wireless-headphones')
    
    // Add to cart
    await page.click('[data-testid="add-to-cart"]')
    
    // Verify cart updated
    const cartBadge = page.locator('[data-testid="cart-badge"]')
    await expect(cartBadge).toHaveText('1')
    
    // Open cart
    await page.click('[data-testid="cart-icon"]')
    
    // Verify product in cart
    await expect(page.locator('text=Wireless Headphones')).toBeVisible()
    await expect(page.locator('[data-testid="cart-total"]')).toContainText('299.99')
  })

  test('updates quantity in cart', async ({ page }) => {
    // Add product to cart first
    await page.goto('/products/wireless-headphones')
    await page.click('[data-testid="add-to-cart"]')
    
    // Go to cart
    await page.goto('/cart')
    
    // Increase quantity
    await page.click('[data-testid="quantity-increase"]')
    
    // Verify quantity updated
    const quantityInput = page.locator('[data-testid="quantity-input"]')
    await expect(quantityInput).toHaveValue('2')
    
    // Verify total updated
    await expect(page.locator('[data-testid="cart-total"]')).toContainText('599.98')
  })

  test('removes item from cart', async ({ page }) => {
    await page.goto('/products/wireless-headphones')
    await page.click('[data-testid="add-to-cart"]')
    await page.goto('/cart')
    
    // Remove item
    await page.click('[data-testid="remove-item"]')
    
    // Verify cart is empty
    await expect(page.locator('text=Your cart is empty')).toBeVisible()
  })
})
```

### Example: Checkout Flow Test

```typescript
// e2e/shopping/checkout.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Checkout Flow', () => {
  test('completes checkout as guest', async ({ page }) => {
    // Add product to cart
    await page.goto('/products/wireless-headphones')
    await page.click('[data-testid="add-to-cart"]')
    
    // Go to checkout
    await page.click('[data-testid="checkout-btn"]')
    await expect(page).toHaveURL(/\/checkout/)
    
    // Fill shipping information
    await page.fill('[name="email"]', 'guest@example.com')
    await page.fill('[name="fullName"]', 'John Doe')
    await page.fill('[name="street"]', '123 Main St')
    await page.fill('[name="city"]', 'Accra')
    await page.fill('[name="zipCode"]', '00000')
    await page.selectOption('[name="country"]', 'GH')
    await page.fill('[name="phone"]', '+233123456789')
    
    // Select shipping method
    await page.click('[data-testid="shipping-standard"]')
    
    // Continue to payment
    await page.click('text=Continue to Payment')
    
    // Verify payment page
    await expect(page).toHaveURL(/\/checkout\/payment/)
    await expect(page.locator('text=Order Summary')).toBeVisible()
  })

  test('applies coupon code', async ({ page }) => {
    await page.goto('/cart')
    
    // Enter coupon
    await page.fill('[data-testid="coupon-input"]', 'SAVE10')
    await page.click('[data-testid="apply-coupon"]')
    
    // Verify discount applied
    await expect(page.locator('text=10% off')).toBeVisible()
    await expect(page.locator('[data-testid="discount-amount"]')).toContainText('-₵29.99')
  })
})
```

## Running E2E Tests

### Basic Commands

```bash
# Run all E2E tests
pnpm exec playwright test

# Run in headed mode (see browser)
pnpm exec playwright test --headed

# Run specific test file
pnpm exec playwright test e2e/shopping/cart.spec.ts

# Run in specific browser
pnpm exec playwright test --project=chromium

# Run in debug mode
pnpm exec playwright test --debug

# Generate test report
pnpm exec playwright show-report
```

### Update package.json

Add these scripts:

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report"
  }
}
```

## Best Practices

### 1. Use Data Test IDs

```tsx
// Add data-testid to important elements
<button data-testid="add-to-cart">Add to Cart</button>
<div data-testid="product-card">...</div>
<input data-testid="search-input" />
```

### 2. Create Reusable Fixtures

```typescript
// e2e/fixtures/test-data.ts
export const testUsers = {
  customer: {
    email: 'customer@test.com',
    password: 'TestPassword123!'
  },
  admin: {
    email: 'admin@test.com',
    password: 'AdminPassword123!'
  }
}

export const testProducts = {
  headphones: {
    name: 'Wireless Headphones',
    price: 299.99
  }
}
```

### 3. Use Page Object Model

```typescript
// e2e/pages/ProductPage.ts
import { Page } from '@playwright/test'

export class ProductPage {
  constructor(private page: Page) {}

  async goto(slug: string) {
    await this.page.goto(`/products/${slug}`)
  }

  async addToCart() {
    await this.page.click('[data-testid="add-to-cart"]')
  }

  async getPrice() {
    return this.page.textContent('[data-testid="price"]')
  }
}

// Use in test
import { ProductPage } from '../pages/ProductPage'

test('adds product to cart', async ({ page }) => {
  const productPage = new ProductPage(page)
  await productPage.goto('wireless-headphones')
  await productPage.addToCart()
})
```

### 4. Handle Authentication

```typescript
// e2e/auth.setup.ts
import { test as setup } from '@playwright/test'

setup('authenticate', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'password')
  await page.click('button[type="submit"]')
  
  // Save auth state
  await page.context().storageState({ path: 'auth.json' })
})

// Use in tests
test.use({ storageState: 'auth.json' })
```

## Visual Testing

Playwright supports visual regression testing:

```typescript
test('product page looks correct', async ({ page }) => {
  await page.goto('/products/wireless-headphones')
  await expect(page).toHaveScreenshot('product-page.png')
})
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: pnpm install
      - name: Install Playwright Browsers
        run: pnpm exec playwright install --with-deps
      - name: Run E2E tests
        run: pnpm test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Debugging Tips

1. **Use Playwright Inspector:**
   ```bash
   pnpm exec playwright test --debug
   ```

2. **Enable slow mode:**
   ```typescript
   test.use({ launchOptions: { slowMo: 500 } })
   ```

3. **Take screenshots:**
   ```typescript
   await page.screenshot({ path: 'screenshot.png' })
   ```

4. **Record videos:**
   ```typescript
   // In playwright.config.ts
   use: {
     video: 'on-first-retry'
   }
   ```

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Examples](https://playwright.dev/docs/examples)

---

**Next Steps:**
1. Install Playwright: `pnpm add -D @playwright/test`
2. Create config file
3. Write your first E2E test
4. Add to CI/CD pipeline
