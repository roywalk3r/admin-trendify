import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/newsletter/route'

beforeEach(() => {
  vi.resetModules()
})

vi.mock('@/lib/prisma', () => {
  const prisma = {
    newsletterSubscriber: {
      findUnique: vi.fn(async ({ where }: any) => {
        if (where.email === 'existing@example.com') {
          return {
            id: 'sub1',
            email: 'existing@example.com',
            isActive: true,
            subscribedAt: new Date()
          }
        }
        return null
      }),
      create: vi.fn(async ({ data }: any) => ({
        id: 'newsub',
        ...data,
        subscribedAt: new Date()
      })),
      update: vi.fn(async ({ where, data }: any) => ({
        id: where.id,
        ...data
      }))
    }
  }
  return { default: prisma, prisma }
})

vi.mock('@/lib/email', () => ({
  sendNewsletterWelcome: vi.fn(async (email: string) => ({
    success: true,
    messageId: 'msg123'
  }))
}))

function buildRequest(body: any): Request {
  return new Request('https://example.com/api/newsletter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
}

describe('Newsletter API - POST', () => {
  it('subscribes new email successfully', async () => {
    const req = buildRequest({ email: 'newuser@example.com' })
    const res = await POST(req)
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.message).toContain('subscribed')
  })

  it('handles duplicate subscription', async () => {
    const req = buildRequest({ email: 'existing@example.com' })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.message).toContain('already subscribed')
  })

  it('validates email format', async () => {
    const req = buildRequest({ email: 'invalid-email' })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('requires email field', async () => {
    const req = buildRequest({})
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('sends welcome email on subscription', async () => {
    const { sendNewsletterWelcome } = await import('@/lib/email') as any
    const req = buildRequest({ email: 'newuser@example.com' })
    await POST(req)
    expect(sendNewsletterWelcome).toHaveBeenCalledWith('newuser@example.com')
  })
})
