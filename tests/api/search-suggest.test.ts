import { describe, it, expect } from 'vitest'
import { GET } from '@/app/api/search/suggest/route'

function buildRequest(query?: string): Request {
  const url = new URL('https://example.com/api/search/suggest')
  if (query !== undefined) {
    url.searchParams.set('q', query)
  }
  return new Request(url.toString())
}

describe('Search Suggest API - GET /api/search/suggest', () => {
  it('returns empty suggestions when query is missing', async () => {
    const req = buildRequest('')
    const res = await GET(req as any)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data).toBeDefined()
    expect(Array.isArray(json.data.suggestions)).toBe(true)
    expect(json.data.suggestions.length).toBe(0)
  })
})
