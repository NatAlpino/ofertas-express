import { http, HttpResponse } from 'msw'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'

import HomePage from '@/app/home/page'
import { offers } from '@/mocks/data'
import { server } from '@/mocks/server'
import { useCartStore } from '@/stores/cart'
import { createWrapper } from '@/tests/utils'
import { useCompletedOffersStore } from '@/stores/offers'

let searchParams: URLSearchParams | null
vi.mock('next/navigation', () => ({ useSearchParams: () => searchParams }))

describe('offers screen', () => {
  beforeEach(() => {
    searchParams = new URLSearchParams()
    useCartStore.getState().clear()
    useCompletedOffersStore.setState({ completedIds: [] })
  })

  it('shows confirmation after a successful checkout', async () => {
    searchParams = new URLSearchParams('checkout=sucesso')
    render(<HomePage />, { wrapper: createWrapper() })

    await screen.findByRole('button', { name: 'Adicionar ao carrinho: Negocie agora' })
    expect(
      within(screen.getByRole('status')).getByText('Acordo confirmado com sucesso!')
    ).toBeVisible()
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

  it('renders an empty list when the API returns no data and search params are unavailable', async () => {
    searchParams = null
    server.use(http.get('/api/offers', () => HttpResponse.json(null)))
    render(<HomePage />, { wrapper: createWrapper() })

    expect(await screen.findByRole('list')).toBeEmptyDOMElement()
    expect(screen.queryByText('Acordo confirmado com sucesso!')).not.toBeInTheDocument()
  })
})
