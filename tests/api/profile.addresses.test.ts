import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from '@/app/api/profile/addresses/route'

beforeEach(() => {
  vi.resetModules()
})

vi.mock('@clerk/nextjs/server', () => ({ auth: vi.fn(async () => ({ userId: 'u1' })) }))

vi.mock('@/lib/prisma', () => {
  const prisma = {
    user: { findFirst: vi.fn(async ({ where }: any) => (where.id === 'u1' ? { id: 'u1' } : null)) },
    address: {
      findMany: vi.fn(async () => [{ id: 'a1', userId: 'u1', fullName: 'John Doe', isDefault: true }]),
      updateMany: vi.fn(async () => ({ count: 1 })),
      create: vi.fn(async ({ data }: any) => ({ id: 'new', ...data })),
    },
    $transaction: vi.fn(async (fn: any) => fn({ address: { updateMany: prisma.address.updateMany, create: prisma.address.create } })),
  }
  return { default: prisma, prisma }
})

function buildReq(body?: any): any {
  return new Request('https://example.com/api/profile/addresses', {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  }) as any
}

describe('Profile Addresses API', () => {
  it('GET returns addresses for authenticated user', async () => {
    const res = await GET()
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(Array.isArray(json.data)).toBe(true)
    expect(json.data[0].id).toBe('a1')
  })

  it('POST creates address and handles default logic', async () => {
    const res = await POST(buildReq({ fullName: 'John', street: '1 Way', city: 'Accra', state: 'GA', zipCode: '000', country: 'GH', phone: '123', isDefault: true }))
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.data?.id).toBe('new')
    expect(json.data?.isDefault).toBe(true)
  })

  it('POST validates required fields', async () => {
    const res = await POST(buildReq({ fullName: 'John' }))
    expect(res.status).toBe(400)
  })

  it('401 when unauthenticated', async () => {
    const { auth } = await import('@clerk/nextjs/server') as any
    auth.mockResolvedValueOnce({ userId: null })
    const res = await GET()
    expect(res.status).toBe(401)
  })
})
