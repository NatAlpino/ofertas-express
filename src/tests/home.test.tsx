
import { http, HttpResponse } from 'msw'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'


import { offers } from '@/mocks/data'
import { server } from '@/mocks/server'


import { useCartStore } from '@/stores/cart'
import { useCompletedOffersStore } from '@/stores/offers'


import HomePage from '@/app/home/page'
import { visibleOffers } from '@/screens/home'
import { createWrapper } from '@/tests/utils'

const replaceMock = vi.fn()
let searchParams: URLSearchParams | null
vi.mock('next/navigation', () => ({
  useSearchParams: () => searchParams,
  useRouter: () => ({ replace: replaceMock }),
}))

describe('offers screen', () => {
  beforeEach(() => {
    searchParams = new URLSearchParams()
    replaceMock.mockClear()
    useCartStore.getState().clear()
    useCompletedOffersStore.setState({ completedIds: [] })
  })

  it.each([
    [undefined, [], []],
    [offers, ['oferta-1'], ['oferta-2', 'oferta-3']],
    [offers, [], ['oferta-1', 'oferta-2', 'oferta-3']],
  ])('visibleOffers(%j, %j) returns %j', (data, completedIds, expected) => {
    expect(visibleOffers(data, completedIds).map((offer) => offer.id)).toEqual(expected)
  })

  it('shows confirmation after a successful checkout', async () => {
    searchParams = new URLSearchParams('checkout=sucesso')
    render(<HomePage />, { wrapper: createWrapper() })

    await screen.findByRole('button', { name: 'Adicionar ao carrinho: Negocie agora' })
    expect(
      within(screen.getByRole('status')).getByText('Acordo confirmado com sucesso!')
    ).toBeVisible()
    expect(replaceMock).toHaveBeenCalledWith('/home')
  })

  it('recovers from a loading error when the user retries', async () => {
    server.use(http.get('/api/offers', () => new HttpResponse(null, { status: 503 })))
    const user = userEvent.setup()
    render(<HomePage />, { wrapper: createWrapper() })

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar as ofertas.'
    )
    server.use(http.get('/api/offers', () => HttpResponse.json(offers)))
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }))

    expect(
      await screen.findByRole('button', { name: 'Adicionar ao carrinho: Negocie agora' })
    ).toBeEnabled()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows a loading error when the API returns an unexpected shape', async () => {
    server.use(
      http.get('/api/offers', () =>
        HttpResponse.json([{ id: 'oferta-1', title: 'Negocie agora', offerPrice: '98000' }])
      )
    )
    render(<HomePage />, { wrapper: createWrapper() })

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar as ofertas.'
    )
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it.each([null, []])(
    'shows the empty state when the API returns %s and search params are unavailable',
    async (payload) => {
      searchParams = null
      server.use(http.get('/api/offers', () => HttpResponse.json(payload)))
      render(<HomePage />, { wrapper: createWrapper() })

      expect(await screen.findByText('Não há ofertas disponíveis')).toBeInTheDocument()
      expect(screen.queryByRole('list')).not.toBeInTheDocument()
      expect(screen.queryByText('Acordo confirmado com sucesso!')).not.toBeInTheDocument()
    }
  )
})
