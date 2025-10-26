# Testing Quick Start Guide 🚀

## Installation & Setup (2 minutes)

### 1. Install Dependencies

```bash
pnpm install
```

This installs all testing dependencies including:
- ✅ Vitest (test framework)
- ✅ React Testing Library
- ✅ jsdom (DOM environment)
- ✅ Coverage tools

### 2. Verify Setup

```bash
# Check installation
pnpm list vitest

# Run type checking
pnpm type-check
```

## Running Tests

### Quick Commands

```bash
# Run all tests
pnpm test

# Watch mode (auto-rerun on changes)
pnpm test:watch

# With coverage report
pnpm vitest run --coverage

# Run specific test file
pnpm test tests/api/cart.test.ts

# Run specific category
pnpm test tests/api           # All API tests
pnpm test tests/components    # All component tests
pnpm test tests/integration   # All integration tests
```

### Using the Test Runner Script

```bash
# Make script executable (first time only)
chmod +x scripts/test-runner.sh

# Run all tests
./scripts/test-runner.sh all

# Run specific categories
./scripts/test-runner.sh api
./scripts/test-runner.sh components
./scripts/test-runner.sh integration
./scripts/test-runner.sh security
./scripts/test-runner.sh performance

# With coverage
./scripts/test-runner.sh api coverage

# Watch mode
./scripts/test-runner.sh watch

# Help
./scripts/test-runner.sh help
```

## Test Suite Overview

### 📂 Test Structure (31 Files)

```
tests/
├── api/                    # 13 files - API endpoints
├── components/             # 4 files - React components
├── lib/                    # 4 files - Utilities
├── hooks/                  # 2 files - Custom hooks
├── integration/            # 2 files - E2E flows
├── ui/                     # 4 files - Pages
├── security/               # 1 file - Security tests
├── performance/            # 1 file - Performance tests
├── helpers/                # Test utilities
└── examples/               # Complete examples
```

### 🎯 Test Coverage

| Category | Files | Tests | Focus |
|----------|-------|-------|-------|
| API Routes | 13 | 80+ | Endpoints, validation, auth |
| Components | 4 | 30+ | UI interactions, rendering |
| Utilities | 4 | 40+ | Functions, calculations |
| Hooks | 2 | 15+ | State management |
| Integration | 2 | 10+ | Complete flows |
| Security | 1 | 20+ | Rate limiting, auth |
| Performance | 1 | 15+ | Caching, optimization |

## Common Workflows

### 1. Test-Driven Development (TDD)

```bash
# 1. Write a failing test
pnpm test tests/api/new-feature.test.ts

# 2. Implement the feature
# Edit your code...

# 3. Watch tests pass
pnpm test:watch
```

### 2. Before Committing

```bash
# Run all tests
pnpm test

# Check coverage
pnpm vitest run --coverage

# Type check
pnpm type-check

# Lint
pnpm lint
```

### 3. Debugging Failed Tests

```bash
# Run specific test with verbose output
pnpm vitest run tests/api/cart.test.ts --reporter=verbose

# Use VS Code debugger
# Open .vscode/launch.json and use "Debug Current Test File"

# Add console.log in your test
it('my test', () => {
  console.log('Debug info:', someVariable)
  expect(someVariable).toBe(expected)
})
```

## Writing Your First Test

### API Test Example

Create `tests/api/my-feature.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '@/app/api/my-feature/route'

beforeEach(() => {
  vi.resetModules()
})

vi.mock('@/lib/prisma', () => ({
  default: {
    myModel: {
      findMany: vi.fn(async () => [{ id: '1', name: 'Test' }])
    }
  }
}))

describe('My Feature API', () => {
  it('returns data successfully', async () => {
    const req = new Request('https://example.com/api/my-feature')
    const res = await GET(req)
    
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data).toBeDefined()
  })
})
```

### Component Test Example

Create `tests/components/my-component.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MyComponent } from '@/components/my-component'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
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

## Test Helpers & Utilities

### Using Mock Data

```typescript
import { MockData } from '@/tests/helpers/mock-data'

// Create mock product
const product = MockData.products.electronics()

// Create bulk products
const products = MockData.products.bulk(10)

// Create mock user
const user = MockData.users.customer()

// Create mock order
const order = MockData.orders.pending()
```

### Using Test Utils

```typescript
import { 
  renderWithProviders,
  mockFetchSuccess,
  createMockProduct 
} from '@/tests/helpers/test-utils'

// Render with providers (theme, etc.)
renderWithProviders(<MyComponent />)

// Mock successful API call
mockFetchSuccess({ data: 'response' })

// Create custom mock data
const product = createMockProduct({ price: 99.99 })
```

## CI/CD Integration

### GitHub Actions (Already Configured)

The test suite automatically runs on:
- ✅ Push to main/develop
- ✅ Pull requests
- ✅ Multiple Node versions (18.x, 20.x)

View workflow: `.github/workflows/test.yml`

### Manual CI Trigger

```bash
# Run tests as they would in CI
CI=true pnpm test

# With coverage for CI
CI=true pnpm vitest run --coverage
```

## Coverage Reports

### Generate Coverage

```bash
# Generate HTML report
pnpm vitest run --coverage

# View report
open coverage/index.html  # macOS
xdg-open coverage/index.html  # Linux
start coverage/index.html  # Windows
```

### Coverage Thresholds

Current thresholds (in `vitest.config.ts`):
- Lines: 80%
- Functions: 80%
- Branches: 80%
- Statements: 80%

## Troubleshooting

### Tests Won't Run

```bash
# Clear cache
rm -rf node_modules/.vite
pnpm vitest run --clearCache

# Reinstall dependencies
rm -rf node_modules
pnpm install
```

### Mock Not Working

```typescript
// Make sure to reset mocks
beforeEach(() => {
  vi.resetModules()
  vi.clearAllMocks()
})

// Check mock path matches exactly
vi.mock('@/lib/prisma', () => ({
  // Mock implementation
}))
```

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 pnpm test
```

## Resources

### Documentation
- 📖 **Complete Guide:** `docs/TESTING_GUIDE.md`
- 📖 **E2E Testing:** `docs/E2E_TESTING_GUIDE.md`
- 📖 **Test Summary:** `TEST_SUITE_SUMMARY.md`
- 📖 **Setup Guide:** `SETUP_TESTS.md`

### External Links
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Quick Reference

### Essential Commands

| Command | Description |
|---------|-------------|
| `pnpm test` | Run all tests once |
| `pnpm test:watch` | Watch mode |
| `pnpm vitest run --coverage` | Generate coverage |
| `pnpm test tests/api` | Run API tests |
| `pnpm type-check` | Type checking |
| `pnpm lint` | Linting |

### Test File Locations

| Test Type | Location | Purpose |
|-----------|----------|---------|
| API | `tests/api/*.test.ts` | API endpoints |
| Components | `tests/components/*.test.tsx` | React components |
| Utils | `tests/lib/*.test.ts` | Utility functions |
| Hooks | `tests/hooks/*.test.ts` | Custom hooks |
| Integration | `tests/integration/*.test.ts` | E2E flows |

### Common Matchers

```typescript
expect(value).toBe(expected)           // Strict equality
expect(value).toEqual(expected)        // Deep equality
expect(value).toBeTruthy()             // Truthy
expect(value).toBeDefined()            // Not undefined
expect(array).toHaveLength(n)          // Array length
expect(string).toContain('text')       // String contains
expect(fn).toHaveBeenCalled()          // Function called
expect(fn).toHaveBeenCalledWith(arg)   // Called with arg
```

## Next Steps

1. ✅ **Install dependencies:** `pnpm install`
2. ✅ **Run tests:** `pnpm test`
3. ✅ **Review coverage:** `pnpm vitest run --coverage`
4. ✅ **Read documentation:** `docs/TESTING_GUIDE.md`
5. ✅ **Write your first test!**

---

**Need Help?** 
- Check `docs/TESTING_GUIDE.md` for comprehensive examples
- Review `tests/examples/complete-examples.test.ts` for patterns
- Run `./scripts/test-runner.sh help` for CLI options

**Happy Testing! 🎉**
