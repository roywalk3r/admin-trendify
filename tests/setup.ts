import '@testing-library/jest-dom'
import React from 'react'

// Make React available globally for JSX in tests
// This avoids having to import React in every test file
// and fixes ReferenceError: React is not defined
// when tsconfig uses jsx: preserve (Next.js default)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).React = React

// Mock next/navigation for client components (App Router)
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}))

// Mock Clerk auth used in API routes (returns no user by default)
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(async () => ({ userId: 'user_123' })),
}))
