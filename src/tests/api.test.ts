import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { server } from '@/mocks/server'
import { apiFetch, ApiError } from '@/services/api'

describe('apiFetch', () => {
  it.each([
    ['missing message', {}],
    ['non-string message', { message: 42 }],
    ['null body', null],
  ])('uses the status fallback for an error with %s', async (_, body) => {
    server.use(http.get('/api/offers', () => HttpResponse.json(body, { status: 503 })))

    await expect(apiFetch('/api/offers')).rejects.toMatchObject({
      name: 'ApiError',
      status: 503,
      message: 'Request failed with status 503',
    })
  })

  it('preserves the HTTP error when its body is not JSON', async () => {
    server.use(http.get('/api/offers', () => HttpResponse.text('unavailable', { status: 502 })))

    await expect(apiFetch('/api/offers')).rejects.toMatchObject({
      status: 502,
      message: 'Request failed with status 502',
    })
  })

  it('returns parsed json on success', async () => {
    const data = await apiFetch<Array<{ id: string }>>('/api/offers')
    expect(data).toHaveLength(3)
  })

  it('throws ApiError on non-OK responses', async () => {
    server.use(
      http.get('/api/offers', () => HttpResponse.json({ message: 'boom' }, { status: 500 }))
    )

    const error = (await apiFetch('/api/offers').catch((err) => err)) as ApiError
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toBe('boom')
    expect(error.status).toBe(500)
  })
})
