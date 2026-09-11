
import { http, HttpResponse } from 'msw'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'


import { checkoutContent } from '@/content/checkout'


import { server } from '@/mocks/server'


import { formatDate } from '@/utils/format'


import { useCartStore } from '@/stores/cart'
import { useHistoryStore } from '@/stores/history'
import { useCompletedOffersStore } from '@/stores/offers'


import CartPage from '@/app/carrinho/page'
import CheckoutPage from '@/app/checkout/page'
import HomePage from '@/app/home/page'
import * as api from '@/services/api'
import { createWrapper } from '@/tests/utils'


const pushMock = vi.fn()
const replaceMock = vi.fn()
const backMock = vi.fn()
const writeTextMock = vi.fn().mockResolvedValue(undefined)

const mockClipboard = () => {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: writeTextMock },
    configurable: true,
  })
}

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, replace: replaceMock, back: backMock }),
  usePathname: () => '/home',
  useSearchParams: () => new URLSearchParams(),
}))

const renderScreen = (ui: React.ReactElement) => render(ui, { wrapper: createWrapper() })

const addOfferToCart = (id = 'oferta-1') =>
  useCartStore.getState().add({
    id,
    title: 'Negocie agora',
    originalDebt: 245000,
    offerPrice: 98000,
  })

const enableV2Flag = () =>
  server.use(http.get('/api/feature-flags/checkoutV2', () => HttpResponse.json({ enabled: true })))

describe('checkout flows', () => {
  beforeEach(() => {
    pushMock.mockClear()
    replaceMock.mockClear()
    backMock.mockClear()
    writeTextMock.mockClear()
    useCartStore.getState().clear()
    useCompletedOffersStore.setState({ completedIds: [] })
    useHistoryStore.setState({ entries: [] })
    server.use(
      http.get('/api/feature-flags/checkoutV2', () => HttpResponse.json({ enabled: false }))
    )
  })

  it('flag off: user picks offers, reviews the cart and confirms the short checkout', async () => {
    const user = userEvent.setup()

    renderScreen(<HomePage />)
    await user.click(
      await screen.findByRole('button', {
        name: 'Adicionar ao carrinho: Negocie agora',
      })
    )
    await user.click(
      screen.getByRole('button', {
        name: 'Adicionar ao carrinho: Acordo rápido',
      })
    )

    const cart = renderScreen(<CartPage />)
    expect(screen.getByText('R$ 1.700,00')).toBeInTheDocument()

    const checkout = renderScreen(<CheckoutPage />)
    await user.click(await screen.findByRole('button', { name: 'Confirmar' }))

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/?checkout=sucesso'))
    expect(useCartStore.getState().items).toHaveLength(0)
    cart.unmount()
    checkout.unmount()
  })

  it('flag on: payment section appears and the chosen method is sent', async () => {
    enableV2Flag()
    let capturedBody: unknown
    server.use(
      http.post('/api/checkout', async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json({ agreementId: 'acordo-9', status: 'confirmed' }, { status: 201 })
      })
    )

    const user = userEvent.setup()
    addOfferToCart()

    renderScreen(<CheckoutPage />)

    await screen.findByRole('group', { name: 'Forma de pagamento' })
    await user.click(screen.getByRole('radio', { name: /Boleto/ }))
    await user.click(screen.getByRole('button', { name: 'Confirmar pagamento' }))

    await waitFor(() =>
      expect(capturedBody).toEqual({
        offerIds: ['oferta-1'],
        paymentMethod: 'boleto',
      })
    )
  })

  it('flag on pix: shows QR code, copies the code and concludes the agreement', async () => {
    enableV2Flag()
    const user = userEvent.setup()
    mockClipboard()
    addOfferToCart()

    renderScreen(<CheckoutPage />)

    await screen.findByRole('group', { name: 'Forma de pagamento' })
    await user.click(screen.getByRole('button', { name: 'Confirmar pagamento' }))

    expect(await screen.findByText('Pagamento via Pix')).toBeInTheDocument()
    expect(screen.getByText(/validade de 30 minutos/)).toBeInTheDocument()
    expect(screen.getByText(/00020126580014br\.gov\.bcb\.pix/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Copiar código' }))
    expect(writeTextMock).toHaveBeenCalledWith(expect.stringContaining('br.gov.bcb.pix'))
    expect(await screen.findByText('Código copiado!')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Concluir' }))

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/home'))
    expect(useCartStore.getState().items).toHaveLength(0)
    expect(useCompletedOffersStore.getState().completedIds).toContain('oferta-1')
  })

  it('flag on boleto: shows barcode, same-day due date and concludes', async () => {
    enableV2Flag()
    const user = userEvent.setup()
    addOfferToCart()

    renderScreen(<CheckoutPage />)

    await screen.findByRole('group', { name: 'Forma de pagamento' })
    await user.click(screen.getByRole('radio', { name: /Boleto/ }))
    await user.click(screen.getByRole('button', { name: 'Confirmar pagamento' }))

    const expectedDue = new Date()
    let remaining = 3
    while (remaining > 0) {
      expectedDue.setDate(expectedDue.getDate() + 1)
      if (expectedDue.getDay() !== 0 && expectedDue.getDay() !== 6) remaining--
    }

    expect(await screen.findByText('Pagamento via boleto')).toBeInTheDocument()
    expect(
      screen.getByText('23793.38128 60007.827136 95000.063305 1 99010000015500')
    ).toBeInTheDocument()
    expect(screen.getByText('Vencimento')).toBeInTheDocument()
    expect(screen.getByText(formatDate(expectedDue.toISOString()))).toBeInTheDocument()
    expect(screen.getByText(/até dois dias para ser compensado/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Concluir' }))

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/home'))
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('canceling the payment dialog returns to the checkout with the cart preserved', async () => {
    enableV2Flag()
    const user = userEvent.setup()
    addOfferToCart()

    renderScreen(<CheckoutPage />)

    await screen.findByRole('group', { name: 'Forma de pagamento' })
    await user.click(screen.getByRole('button', { name: 'Confirmar pagamento' }))

    await screen.findByText('Pagamento via Pix')
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(screen.queryByText('Pagamento via Pix')).not.toBeInTheDocument()
    expect(pushMock).not.toHaveBeenCalled()
    expect(useCartStore.getState().items).toHaveLength(1)
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Confirmar pagamento' })).toBeInTheDocument()
    )
  })

  it('re-submitting the same checkout replays the same agreement (idempotency)', async () => {
    enableV2Flag()
    const user = userEvent.setup()
    addOfferToCart()

    const responses: { agreementId: string }[] = []
    const captureResponse = async ({ request, response }: { request: Request; response: Response }) => {
      if (request.method === 'POST' && request.url.includes('/api/checkout')) {
        responses.push(await response.clone().json())
      }
    }
    server.events.on('response:mocked', captureResponse)

    try {
      renderScreen(<CheckoutPage />)

      await screen.findByRole('group', { name: 'Forma de pagamento' })
      await user.click(screen.getByRole('button', { name: 'Confirmar pagamento' }))
      await screen.findByText('Pagamento via Pix')
      await user.click(screen.getByRole('button', { name: 'Cancelar' }))
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

      await user.click(screen.getByRole('button', { name: 'Confirmar pagamento' }))
      await screen.findByText('Pagamento via Pix')
      await user.click(screen.getByRole('button', { name: 'Concluir' }))

      expect(responses).toHaveLength(2)
      expect(responses[1].agreementId).toBe(responses[0].agreementId)
      expect(useHistoryStore.getState().entries).toHaveLength(1)
      expect(useHistoryStore.getState().entries[0].id).toBe(responses[0].agreementId)
    } finally {
      server.events.removeListener('response:mocked', captureResponse)
    }
  })

  it('completed offers no longer appear in the offers list', async () => {
    enableV2Flag()
    const user = userEvent.setup()
    addOfferToCart()

    renderScreen(<CheckoutPage />)
    await screen.findByRole('group', { name: 'Forma de pagamento' })
    await user.click(screen.getByRole('button', { name: 'Confirmar pagamento' }))
    await screen.findByText('Pagamento via Pix')
    await user.click(screen.getByRole('button', { name: 'Concluir' }))

    renderScreen(<HomePage />)

    expect(
      await screen.findByRole('button', { name: 'Adicionar ao carrinho: Acordo rápido' })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Adicionar ao carrinho: Negocie agora' })
    ).not.toBeInTheDocument()
  })

  it('shows an empty state when every offer has been paid', async () => {
    useCompletedOffersStore.setState({ completedIds: ['oferta-1', 'oferta-2', 'oferta-3'] })

    renderScreen(<HomePage />)

    expect(await screen.findByText('Não há ofertas disponíveis')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Não há ofertas disponíveis')
    expect(screen.queryByRole('button', { name: /Adicionar ao carrinho/ })).not.toBeInTheDocument()
  })

  it('checkout API error: shows a message and keeps the cart', async () => {
    server.use(
      http.post('/api/checkout', () =>
        HttpResponse.json({ message: 'Erro interno, tente mais tarde' }, { status: 500 })
      )
    )

    const user = userEvent.setup()
    addOfferToCart()

    renderScreen(<CheckoutPage />)
    await user.click(await screen.findByRole('button', { name: 'Confirmar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Erro interno, tente mais tarde')
    expect(pushMock).not.toHaveBeenCalled()
    expect(useCartStore.getState().items).toHaveLength(1)
  })

  it('prevents duplicate submission while the checkout request is pending', async () => {
    const response = Promise.withResolvers<Response>()
    const handler = vi.fn(() => response.promise)
    server.use(http.post('/api/checkout', handler))
    const user = userEvent.setup()
    addOfferToCart()
    renderScreen(<CheckoutPage />)

    try {
      await user.click(await screen.findByRole('button', { name: 'Confirmar' }))
      const pendingButton = await screen.findByRole('button', { name: checkoutContent.confirming })
      expect(pendingButton).toBeDisabled()
      expect(pendingButton).toHaveAttribute('aria-busy', 'true')
      await user.keyboard('{Enter}')
      expect(handler).toHaveBeenCalledOnce()
    } finally {
      response.resolve(HttpResponse.json({ agreementId: 'acordo-pending', status: 'confirmed' }))
    }
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/?checkout=sucesso'))
  })

  it('shows a generic message for non-Error failures and clears it when changing payment method', async () => {
    enableV2Flag()
    const user = userEvent.setup()
    addOfferToCart()
    renderScreen(<CheckoutPage />)
    await screen.findByRole('button', { name: 'Confirmar pagamento' })
    const request = vi.spyOn(api, 'apiFetch').mockRejectedValueOnce('connection interrupted')

    try {
      await user.click(screen.getByRole('button', { name: 'Confirmar pagamento' }))
      expect(await screen.findByRole('alert')).toHaveTextContent(checkoutContent.genericError)
      expect(useCartStore.getState().items).toHaveLength(1)
      expect(pushMock).not.toHaveBeenCalled()

      await user.click(screen.getByRole('radio', { name: /Boleto/ }))
      await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument())
    } finally {
      request.mockRestore()
    }
  })

  it('flag API failure: falls back to the short flow', async () => {
    server.use(
      http.get('/api/feature-flags/checkoutV2', () =>
        HttpResponse.json({ message: 'flag service down' }, { status: 500 })
      )
    )

    addOfferToCart()

    renderScreen(<CheckoutPage />)

    await screen.findByRole('button', { name: 'Confirmar' })
    expect(screen.queryByRole('group', { name: 'Forma de pagamento' })).not.toBeInTheDocument()
  })

  it('cart and checkout screens return to the previous route', async () => {
    window.history.replaceState({ idx: 1 }, '')
    const user = userEvent.setup()
    addOfferToCart()
    const cart = renderScreen(<CartPage />)
    await user.click(screen.getByRole('button', { name: 'Voltar' }))
    expect(backMock).toHaveBeenCalledTimes(1)
    cart.unmount()

    renderScreen(<CheckoutPage />)
    await user.click(screen.getByRole('button', { name: 'Voltar' }))
    expect(backMock).toHaveBeenCalledTimes(2)
  })

  it('back button falls back to the offers list when there is no internal history', async () => {
    window.history.replaceState(null, '')
    const user = userEvent.setup()
    addOfferToCart()

    renderScreen(<CartPage />)
    await user.click(screen.getByRole('button', { name: 'Voltar' }))

    expect(backMock).not.toHaveBeenCalled()
    expect(pushMock).toHaveBeenCalledWith('/home')
  })
})
