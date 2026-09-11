import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import CheckoutPage from '@/app/checkout/page'
import { checkoutContent } from '@/content/checkout'
import { server } from '@/mocks/server'
import { useCartStore } from '@/stores/cart'
import { useHistoryStore } from '@/stores/history'
import { useCompletedOffersStore } from '@/stores/offers'
import { createTestQueryClient, createWrapper } from '@/tests/utils'

const pushMock = vi.fn()
const replaceMock = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, replace: replaceMock, back: vi.fn() }),
  usePathname: () => '/checkout',
  useSearchParams: () => new URLSearchParams(),
}))

const renderScreen = (ui: React.ReactElement, client = createTestQueryClient()) => ({
  client,
  ...render(ui, { wrapper: createWrapper(client) }),
})

const addOfferToCart = () =>
  useCartStore.getState().add({
    id: 'oferta-1',
    title: 'Negocie agora',
    originalDebt: 245000,
    offerPrice: 98000,
  })

const flagHandler = (response: Response | Promise<Response>) =>
  server.use(http.get('/api/feature-flags/checkoutV2', () => response))

describe('checkout feature flag toxicity', () => {
  beforeEach(() => {
    pushMock.mockClear()
    replaceMock.mockClear()
    useCartStore.getState().clear()
    useHistoryStore.setState({ entries: [] })
    useCompletedOffersStore.setState({ completedIds: [] })
    flagHandler(HttpResponse.json({ enabled: false }))
  })

  it.each([
    ['enabled as string', () => HttpResponse.json({ enabled: 'yes' })],
    ['enabled missing', () => HttpResponse.json({})],
    ['null body', () => HttpResponse.json(null)],
    [
      'malformed json',
      () => new HttpResponse('not json {{', { headers: { 'Content-Type': 'application/json' } }),
    ],
  ])('flag response with %s falls back to the short flow', async (_label, respond) => {
    flagHandler(respond())
    addOfferToCart()

    renderScreen(<CheckoutPage />)

    await screen.findByRole('button', { name: 'Confirmar' })
    expect(
      screen.queryByRole('group', { name: checkoutContent.paymentLegend })
    ).not.toBeInTheDocument()
  })

  it('flag pending: shows the loading state and hides the confirm button until it resolves', async () => {
    const deferred = Promise.withResolvers<Response>()
    flagHandler(deferred.promise)
    addOfferToCart()

    renderScreen(<CheckoutPage />)

    expect(screen.getByRole('status')).toHaveTextContent(checkoutContent.flagPending)
    expect(screen.queryByRole('button', { name: /Confirmar/ })).not.toBeInTheDocument()

    deferred.resolve(HttpResponse.json({ enabled: true }))

    await screen.findByRole('group', { name: checkoutContent.paymentLegend })
    expect(screen.getByRole('button', { name: checkoutContent.confirmPayment })).toBeInTheDocument()
  })

  it('flag refetch from off to on shows the payment section without remounting', async () => {
    addOfferToCart()
    const { client } = renderScreen(<CheckoutPage />)

    await screen.findByRole('button', { name: 'Confirmar' })
    expect(
      screen.queryByRole('group', { name: checkoutContent.paymentLegend })
    ).not.toBeInTheDocument()

    flagHandler(HttpResponse.json({ enabled: true }))
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['feature-flags', 'checkoutV2'] })
    })

    await screen.findByRole('group', { name: checkoutContent.paymentLegend })
  })

  it('flag refetch from on to off drops the chosen method from the payload', async () => {
    let capturedBody: unknown
    server.use(
      http.post('/api/checkout', async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json({ agreementId: 'acordo-9', status: 'confirmed' }, { status: 201 })
      })
    )
    flagHandler(HttpResponse.json({ enabled: true }))
    const user = userEvent.setup()
    addOfferToCart()
    const { client } = renderScreen(<CheckoutPage />)

    await screen.findByRole('group', { name: checkoutContent.paymentLegend })
    await user.click(screen.getByRole('radio', { name: /Boleto/ }))

    flagHandler(HttpResponse.json({ enabled: false }))
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['feature-flags', 'checkoutV2'] })
    })

    await screen.findByRole('button', { name: 'Confirmar' })
    expect(
      screen.queryByRole('group', { name: checkoutContent.paymentLegend })
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Confirmar' }))

    await waitFor(() => expect(capturedBody).toEqual({ offerIds: ['oferta-1'] }))
  })

  it('flag network error falls back to the short flow', async () => {
    flagHandler(HttpResponse.error())
    addOfferToCart()

    renderScreen(<CheckoutPage />)

    await screen.findByRole('button', { name: 'Confirmar' })
    expect(
      screen.queryByRole('group', { name: checkoutContent.paymentLegend })
    ).not.toBeInTheDocument()
  })

  it('empty cart redirects to the cart screen even while the flag is pending', async () => {
    const deferred = Promise.withResolvers<Response>()
    flagHandler(deferred.promise)

    renderScreen(<CheckoutPage />)

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith('/carrinho'))
    deferred.resolve(HttpResponse.json({ enabled: true }))
  })
})
