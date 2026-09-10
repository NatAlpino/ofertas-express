import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import HomePage from '@/app/page'
import CartPage from '@/app/carrinho/page'
import CheckoutPage from '@/app/checkout/page'
import { useCartStore } from '@/store/cart'
import { createWrapper } from '@/tests/utils'
import { server } from '@/mocks/server'

const pushMock = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, replace: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

const renderScreen = (ui: React.ReactElement) => render(ui, { wrapper: createWrapper() })

describe('checkout flows', () => {
  beforeEach(() => {
    pushMock.mockClear()
    useCartStore.getState().clear()
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
    server.use(
      http.get('/api/feature-flags/checkoutV2', () => HttpResponse.json({ enabled: true }))
    )
    let capturedBody: unknown
    server.use(
      http.post('/api/checkout', async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json({ agreementId: 'acordo-9', status: 'confirmed' }, { status: 201 })
      })
    )

    const user = userEvent.setup()
    useCartStore.getState().add({
      id: 'oferta-1',
      title: 'Negocie agora',
      originalDebt: 245000,
      offerPrice: 98000,
    })

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

  it('checkout API error: shows a message and keeps the cart', async () => {
    server.use(
      http.post('/api/checkout', () =>
        HttpResponse.json({ message: 'Erro interno, tente mais tarde' }, { status: 500 })
      )
    )

    const user = userEvent.setup()
    useCartStore.getState().add({
      id: 'oferta-1',
      title: 'Negocie agora',
      originalDebt: 245000,
      offerPrice: 98000,
    })

    renderScreen(<CheckoutPage />)
    await user.click(await screen.findByRole('button', { name: 'Confirmar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Erro interno, tente mais tarde')
    expect(pushMock).not.toHaveBeenCalled()
    expect(useCartStore.getState().items).toHaveLength(1)
  })

  it('flag API failure: falls back to the short flow', async () => {
    server.use(
      http.get('/api/feature-flags/checkoutV2', () =>
        HttpResponse.json({ message: 'flag service down' }, { status: 500 })
      )
    )

    useCartStore.getState().add({
      id: 'oferta-2',
      title: 'Acordo rápido',
      originalDebt: 120000,
      offerPrice: 72000,
    })

    renderScreen(<CheckoutPage />)

    await screen.findByRole('button', { name: 'Confirmar' })
    expect(screen.queryByRole('group', { name: 'Forma de pagamento' })).not.toBeInTheDocument()
  })
})
