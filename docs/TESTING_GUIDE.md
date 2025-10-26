# Testing Guide for Trendify

## Overview

Trendify uses **Vitest** as the testing framework with **React Testing Library** for component testing. The test suite provides comprehensive coverage of API routes, components, utilities, hooks, and integration flows.

## Table of Contents

- [Setup](#setup)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Test Coverage](#test-coverage)
- [Writing Tests](#writing-tests)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Setup

### Prerequisites

Ensure you have all dependencies installed:

```bash
pnpm install
```

### Test Dependencies

- **vitest** - Test framework
- **@testing-library/react** - React component testing
- **@testing-library/jest-dom** - Custom matchers
- **@testing-library/user-event** - User interaction simulation
- **msw** - API mocking (if needed)
- **@vitest/coverage-v8** - Code coverage

---

## Running Tests

### Run All Tests

```bash
pnpm test
```

### Watch Mode (Auto-rerun on changes)

```bash
pnpm test:watch
```

### Run Specific Test File

```bash
pnpm test tests/api/cart.test.ts
```

### Run Tests with Coverage

```bash
pnpm vitest run --coverage
```

### Run Tests by Pattern

```bash
# Run all API tests
pnpm test tests/api

# Run all component tests
pnpm test tests/components

# Run integration tests
pnpm test tests/integration
```

---

## Test Structure

```
tests/
├── setup.ts                    # Global test setup
├── api/                        # API route tests
│   ├── cart.test.ts
│   ├── products.test.ts
│   ├── checkout.test.ts
│   ├── reviews.test.ts
│   ├── newsletter.test.ts
│   ├── paystack.verify.test.ts
│   ├── my-orders.get.test.ts
│   ├── orders.post.idempotency.test.ts
│   └── profile.addresses.test.ts
├── components/                 # Component tests
│   ├── cart-item.test.tsx
│   ├── product-card.test.tsx
│   ├── search-bar.test.tsx
│   └── review-form.test.tsx
├── lib/                        # Utility function tests
│   ├── cart-store.test.ts
│   ├── utils.test.ts
│   └── shipping.test.ts
├── hooks/                      # Custom hook tests
│   ├── use-cart-sync.test.ts
│   └── use-product-view.test.ts
├── integration/                # Integration tests
│   ├── checkout-flow.test.ts
│   └── user-flow.test.ts
└── ui/                         # UI tests
    ├── theme.toggle.test.tsx
    ├── order.details.page.test.tsx
    ├── checkout.confirm.page.test.tsx
    └── order.track.page.test.tsx
```

---

## Test Coverage

### Current Coverage Areas

#### API Routes (tests/api/)
- ✅ Cart management (GET, POST, PATCH, DELETE)
- ✅ Product listing and details
- ✅ Product reviews
- ✅ Checkout process
- ✅ Newsletter subscription
- ✅ Payment verification (Paystack)
- ✅ Order management
- ✅ User addresses

#### Components (tests/components/)
- ✅ CartItem - quantity updates, removal
- ✅ ProductCard - display, add to cart, stock status
- ✅ SearchBar - input, suggestions, navigation
- ✅ ReviewForm - validation, submission

#### Utilities (tests/lib/)
- ✅ Cart store (Zustand) - add, remove, update, calculations
- ✅ Utility functions - formatting, validation
- ✅ Shipping calculations

#### Hooks (tests/hooks/)
- ✅ useCartSync - server synchronization
- ✅ useProductView - analytics tracking

#### Integration (tests/integration/)
- ✅ Complete checkout flow
- ✅ User journey (browse, search, wishlist, profile)

---

## Writing Tests

### API Route Test Example

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from '@/app/api/example/route'

beforeEach(() => {
  vi.resetModules()
})

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  // Your mock implementation
}))

describe('Example API', () => {
  it('returns data successfully', async () => {
    const req = new Request('https://example.com/api/example')
    const res = await GET(req)
    expect(res.status).toBe(200)
  })
})
```

### Component Test Example

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MyComponent } from '@/components/my-component'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const onClick = vi.fn()
    render(<MyComponent onClick={onClick} />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(onClick).toHaveBeenCalled()
  })
})
```

### Hook Test Example

```typescript
import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useMyHook } from '@/hooks/use-my-hook'

describe('useMyHook', () => {
  it('returns expected data', async () => {
    const { result } = renderHook(() => useMyHook())
    
    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })
  })
})
```

### Integration Test Example

```typescript
import { describe, it, expect } from 'vitest'

describe('User Flow', () => {
  it('completes full user journey', async () => {
    // Step 1: Browse products
    const { GET: getProducts } = await import('@/app/api/products/route')
    const res1 = await getProducts(new Request('...'))
    expect(res1.status).toBe(200)

    // Step 2: Add to cart
    const { POST: addToCart } = await import('@/app/api/cart/route')
    const res2 = await addToCart(new Request('...'))
    expect(res2.status).toBe(200)

    // Continue testing the flow...
  })
})
```

---

## Best Practices

### 1. Test Isolation
- Use `beforeEach` to reset mocks and state
- Each test should be independent
- Don't rely on test execution order

### 2. Mocking
- Mock external dependencies (APIs, databases, services)
- Use `vi.mock()` for module mocking
- Reset mocks between tests with `vi.resetModules()`

### 3. Assertions
- Use descriptive assertions
- Test both success and error cases
- Validate edge cases

### 4. Test Naming
- Use descriptive test names: `it('handles user login with valid credentials')`
- Group related tests with `describe` blocks
- Follow AAA pattern: Arrange, Act, Assert

### 5. Component Testing
- Test user interactions, not implementation
- Use `screen.getByRole()` over `getByTestId()`
- Test accessibility features

### 6. Async Testing
- Use `waitFor()` for async operations
- Don't forget to `await` promises
- Handle loading and error states

### 7. Coverage Goals
- Aim for 80%+ code coverage
- Focus on critical paths first
- Don't test implementation details

---

## Common Testing Patterns

### Testing with User Events

```typescript
import userEvent from '@testing-library/user-event'

it('handles user input', async () => {
  const user = userEvent.setup()
  render(<MyForm />)
  
  const input = screen.getByRole('textbox')
  await user.type(input, 'test input')
  
  expect(input).toHaveValue('test input')
})
```

### Testing API Errors

```typescript
it('handles API errors', async () => {
  const { myApiCall } = await import('@/lib/api')
  myApiCall.mockRejectedValueOnce(new Error('Network error'))
  
  render(<MyComponent />)
  
  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument()
  })
})
```

### Testing with Authentication

```typescript
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(async () => ({ userId: 'user123' }))
}))

it('requires authentication', async () => {
  const { auth } = await import('@clerk/nextjs/server')
  auth.mockResolvedValueOnce({ userId: null })
  
  const res = await GET()
  expect(res.status).toBe(401)
})
```

### Testing Loading States

```typescript
it('shows loading state', () => {
  render(<MyComponent isLoading={true} />)
  expect(screen.getByText(/loading/i)).toBeInTheDocument()
})
```

---

## Troubleshooting

### Tests Failing Due to Imports

**Problem:** Module not found or import errors

**Solution:**
- Check path aliases in `vitest.config.ts`
- Ensure all dependencies are installed
- Verify mock paths match actual file paths

### Async Tests Timing Out

**Problem:** Tests hang or timeout

**Solution:**
- Increase timeout: `it('test', async () => {...}, 10000)`
- Check for unresolved promises
- Use `waitFor()` with proper conditions

### Mocks Not Working

**Problem:** Mocks not being applied

**Solution:**
- Call `vi.resetModules()` in `beforeEach`
- Check mock path matches exactly
- Ensure mock is defined before import

### Component Not Rendering

**Problem:** Component tests fail to render

**Solution:**
- Check for missing providers (Theme, Router, etc.)
- Add required context in test setup
- Verify component props are valid

### Coverage Not Accurate

**Problem:** Coverage reports incorrect numbers

**Solution:**
- Run `pnpm vitest run --coverage`
- Check `.gitignore` excludes coverage folder
- Ensure all source files are included

---

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm test
      - run: pnpm vitest run --coverage
```

---

## Test Configuration

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      reporter: ['text', 'lcov', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '*.config.*',
        'dist/'
      ]
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

### tests/setup.ts

```typescript
import '@testing-library/jest-dom'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn()
  }),
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({})
}))

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(async () => ({ userId: 'user_123' }))
}))
```

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [Vitest Mock Functions](https://vitest.dev/api/mock.html)

---

## Contributing

When adding new features:

1. Write tests alongside code (TDD encouraged)
2. Maintain test coverage above 80%
3. Update this guide if adding new testing patterns
4. Run full test suite before committing

---

## Summary

- ✅ **21+ test files** covering critical functionality
- ✅ **API routes** fully tested
- ✅ **Components** tested with user interactions
- ✅ **Utilities and hooks** covered
- ✅ **Integration tests** for complete flows
- ✅ **CI-ready** with GitHub Actions support

Happy Testing! 🎉
