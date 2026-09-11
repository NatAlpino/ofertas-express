import { QueryClient } from '@tanstack/react-query'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { exposeFlagToggle, setCheckoutV2Override } from '@/mocks/flag-toggle'
import { CHECKOUT_V2_FLAG_KEY } from '@/mocks/handlers'

describe('msw mock server', () => {
  afterEach(() => window.localStorage.clear())

  it('enables checkout V2 by default', async () => {
    const response = await fetch('/api/feature-flags/checkoutV2')

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ enabled: true })
  })

  it.each([{}, { offerIds: [] }, { offerIds: 'oferta-1' }])(
    'rejects checkout with invalid offer IDs: %j',
    async (body) => {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      expect(response.status).toBe(400)
      expect(await response.json()).toEqual({ message: 'offerIds is required' })
    }
  )

  it('creates a new agreement when no idempotency key is sent', async () => {
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offerIds: ['oferta-1'] }),
    })

    expect(response.status).toBe(201)
    expect(await response.json()).toMatchObject({ agreementId: 'acordo-123', status: 'confirmed' })
  })

  it.each([
    ['false', false],
    ['true', true],
  ])('serves the localStorage override %s for the checkout flag', async (value, expected) => {
    window.localStorage.setItem(CHECKOUT_V2_FLAG_KEY, value)

    const response = await fetch('/api/feature-flags/checkoutV2')

    expect(await response.json()).toEqual({ enabled: expected })
  })

  it('setCheckoutV2Override writes and clears the override', () => {
    setCheckoutV2Override(false)
    expect(window.localStorage.getItem(CHECKOUT_V2_FLAG_KEY)).toBe('false')

    setCheckoutV2Override(null)
    expect(window.localStorage.getItem(CHECKOUT_V2_FLAG_KEY)).toBeNull()
  })

  it('window.setCheckoutV2 stores the override and invalidates the flag query', () => {
    const client = new QueryClient()
    const invalidate = vi.spyOn(client, 'invalidateQueries').mockResolvedValue(undefined)
    exposeFlagToggle(client)

    window.setCheckoutV2?.(false)

    expect(window.localStorage.getItem(CHECKOUT_V2_FLAG_KEY)).toBe('false')
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['feature-flags', 'checkoutV2'] })
  })
})
