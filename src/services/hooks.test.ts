import { describe, expect, it } from 'vitest'
import { waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { renderHookWithClient } from '@/tests/utils'
import { useCheckoutFlag, useConfirmCheckout, useOffers } from '@/services/hooks'

describe('useOffers', () => {
  it('loads offers with loading then success state', async () => {
    const { result } = renderHookWithClient(() => useOffers())

    expect(result.current.isPending).toBe(true)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(3)
    expect(result.current.data?.[0].title).toBe('Negocie agora')
  })

  it('exposes an error state when the request fails', async () => {
    server.use(
      http.get('/api/offers', () => HttpResponse.json({ message: 'fail' }, { status: 500 }))
    )

    const { result } = renderHookWithClient(() => useOffers())
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useCheckoutFlag', () => {
  it('returns true when the flag is enabled', async () => {
    const { result } = renderHookWithClient(() => useCheckoutFlag())
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.isV2).toBe(true)
  })

  it('returns false when the flag is disabled', async () => {
    server.use(
      http.get('/api/feature-flags/checkoutV2', () => HttpResponse.json({ enabled: false }))
    )

    const { result } = renderHookWithClient(() => useCheckoutFlag())
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.isV2).toBe(false)
  })

  it('falls back to false when the flag request fails', async () => {
    server.use(
      http.get('/api/feature-flags/checkoutV2', () =>
        HttpResponse.json({ message: 'fail' }, { status: 500 })
      )
    )

    const { result } = renderHookWithClient(() => useCheckoutFlag())
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.isV2).toBe(false)
  })
})

describe('useConfirmCheckout', () => {
  it('sends the payment method when provided', async () => {
    let capturedBody: unknown
    server.use(
      http.post('/api/checkout', async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json({ agreementId: 'acordo-x', status: 'confirmed' }, { status: 201 })
      })
    )

    const { result } = renderHookWithClient(() => useConfirmCheckout())
    result.current.mutate({ offerIds: ['oferta-1'], paymentMethod: 'boleto' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(capturedBody).toEqual({
      offerIds: ['oferta-1'],
      paymentMethod: 'boleto',
    })
  })

  it('omits the payment method when not provided', async () => {
    let capturedBody: unknown
    server.use(
      http.post('/api/checkout', async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json({ agreementId: 'acordo-y', status: 'confirmed' }, { status: 201 })
      })
    )

    const { result } = renderHookWithClient(() => useConfirmCheckout())
    result.current.mutate({ offerIds: ['oferta-1', 'oferta-2'] })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(capturedBody).toEqual({ offerIds: ['oferta-1', 'oferta-2'] })
  })
})
