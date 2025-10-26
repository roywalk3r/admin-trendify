# Test Suite for Trendify

This directory contains the comprehensive test suite for the Trendify e-commerce platform.

## Quick Start

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# With coverage
pnpm vitest run --coverage
```

## Test Categories

### 📡 API Tests (`/api`)
Tests for all API routes including cart, products, checkout, reviews, and payment verification.

- `cart.test.ts` - Cart CRUD operations
- `products.test.ts` - Product listing and filtering
- `checkout.test.ts` - Checkout flow and validation
- `reviews.test.ts` - Product review management
- `newsletter.test.ts` - Newsletter subscriptions
- `paystack.verify.test.ts` - Payment verification
- `profile.addresses.test.ts` - User address management

### 🎨 Component Tests (`/components`)
Tests for React components with user interaction scenarios.

- `cart-item.test.tsx` - Cart item display and actions
- `product-card.test.tsx` - Product cards with add-to-cart
- `search-bar.test.tsx` - Search functionality
- `review-form.test.tsx` - Review submission form

### 🧰 Library Tests (`/lib`)
Tests for utility functions, store, and helper modules.

- `cart-store.test.ts` - Zustand cart state management
- `utils.test.ts` - Utility functions (formatting, validation)
- `shipping.test.ts` - Shipping cost calculations

### 🪝 Hook Tests (`/hooks`)
Tests for custom React hooks.

- `use-cart-sync.test.ts` - Cart synchronization hook
- `use-product-view.test.ts` - Product view tracking hook

### 🔗 Integration Tests (`/integration`)
End-to-end flow tests covering complete user journeys.

- `checkout-flow.test.ts` - Complete checkout process
- `user-flow.test.ts` - Browse, search, wishlist, profile

### 🖥️ UI Tests (`/ui`)
Page and UI component tests.

- `theme.toggle.test.tsx` - Theme switching
- `order.details.page.test.tsx` - Order details page
- `checkout.confirm.page.test.tsx` - Checkout confirmation
- `order.track.page.test.tsx` - Order tracking page

## Test Statistics

- **Total Test Files:** 21+
- **Test Categories:** 6
- **Coverage Goal:** 80%+

## File Structure

```
tests/
├── README.md              # This file
├── setup.ts               # Global test configuration
├── api/                   # API route tests (9 files)
├── components/            # Component tests (4 files)
├── lib/                   # Library tests (3 files)
├── hooks/                 # Hook tests (2 files)
├── integration/           # Integration tests (2 files)
└── ui/                    # UI tests (4 files)
```

## Key Features

✅ **Comprehensive Coverage** - All critical paths tested  
✅ **Isolated Tests** - Each test runs independently  
✅ **Mocked Dependencies** - External services properly mocked  
✅ **Integration Tests** - Complete user flows validated  
✅ **CI/CD Ready** - Configured for automated testing  

## Writing New Tests

1. Choose the appropriate directory based on what you're testing
2. Follow existing patterns for consistency
3. Use descriptive test names
4. Mock external dependencies
5. Test both success and error cases

See [TESTING_GUIDE.md](../docs/TESTING_GUIDE.md) for detailed documentation.

## Common Commands

```bash
# Run specific test file
pnpm test tests/api/cart.test.ts

# Run all API tests
pnpm test tests/api

# Run with coverage report
pnpm vitest run --coverage

# Watch mode for specific file
pnpm test:watch tests/components/product-card.test.tsx
```

## Mocking Strategy

- **Prisma:** Mocked in test files with `vi.mock('@/lib/prisma')`
- **Clerk Auth:** Mocked in `setup.ts` and overridden per test
- **Next Navigation:** Mocked in `setup.ts`
- **External APIs:** Mocked (Paystack, Resend, etc.)

## CI Integration

Tests are configured to run automatically on:
- Push to any branch
- Pull requests
- Pre-deployment checks

## Troubleshooting

**Tests not running?**
- Check Node version (18+)
- Run `pnpm install`
- Clear cache: `pnpm vitest run --clearCache`

**Mocks not working?**
- Ensure `vi.resetModules()` in `beforeEach`
- Check mock paths match import paths

**Coverage issues?**
- Run `pnpm vitest run --coverage`
- Check `.gitignore` excludes coverage folders

## Contributing

When adding new features:
1. Write tests first (TDD)
2. Ensure existing tests pass
3. Maintain coverage above 80%
4. Update documentation

---

**Questions?** See [TESTING_GUIDE.md](../docs/TESTING_GUIDE.md) for comprehensive documentation.
