import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { server } from '@/mocks/server'

import { apiFetch, ApiError } from '@/services/api'
import {
  parseCheckoutFlag,
  parseCheckoutResponse,
  parseOffers,
} from '@/services/contracts'

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

  it('returns undefined for a success response without a json body', async () => {
    server.use(http.get('/api/offers', () => new HttpResponse(null, { status: 204 })))

    await expect(apiFetch('/api/offers')).resolves.toBeUndefined()
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

describe('api contracts', () => {
  it.each([[null, []], [[], []]])('parseOffers(%j) returns %j', (data, expected) => {
    expect(parseOffers(data)).toEqual(expected)
  })

  it.each([
    [[{ id: 'x' }]],
    [[42]],
    [[{}]],
    [[{ id: 1, title: 'x', originalDebt: 1, offerPrice: 1 }]],
    ['oferta-1'],
  ])('parseOffers rejects an invalid payload: %j', (data) => {
    expect(() => parseOffers(data)).toThrow('Invalid offers payload')
  })

  it.each([
    [{ enabled: true }, true],
    [{ enabled: 'yes' }, false],
    [{}, false],
    [null, false],
  ])('parseCheckoutFlag(%j) normalizes to enabled=%s', (data, expected) => {
    expect(parseCheckoutFlag(data)).toEqual({ enabled: expected })
  })

  const validPixPayment = {
    method: 'pix',
    pix: { qrCodePayload: 'payload', copyCode: 'code' },
  }

  it('parseCheckoutResponse accepts a valid response', () => {
    expect(
      parseCheckoutResponse({ agreementId: 'acordo-1', status: 'confirmed', payment: validPixPayment })
    ).toEqual({ agreementId: 'acordo-1', status: 'confirmed', payment: validPixPayment })
  })

  it.each([
    [null],
    [{ agreementId: 1, status: 'confirmed' }],
    [{ agreementId: 'acordo-1', status: 'pending' }],
    [{ agreementId: 'acordo-1', status: 'confirmed', payment: 'pix' }],
    [{ agreementId: 'acordo-1', status: 'confirmed', payment: { method: 'pix' } }],
    [{ agreementId: 'acordo-1', status: 'confirmed', payment: { method: 'debito' } }],
  ])('parseCheckoutResponse rejects an invalid payload: %j', (data) => {
    expect(() => parseCheckoutResponse(data)).toThrow('Invalid checkout response')
  })
})
