import { http, HttpResponse } from 'msw'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

import { ThemeProvider } from '@mui/material'

import { AppShell } from '@/components/app-shell'

import LoginRoute from '@/app/login/page'
import ProfileRoute from '@/app/perfil/page'
import CheckoutRoute from '@/app/checkout/page'
import HistoryRoute from '@/app/historico/page'

import { theme } from '@/theme'
import { server } from '@/mocks/server'
import { useCartStore } from '@/stores/cart'
import { createWrapper } from '@/tests/utils'
import { useHistoryStore } from '@/stores/history'
import { useSessionStore } from '@/stores/session'

const pushMock = vi.fn()
const replaceMock = vi.fn()
const backMock = vi.fn()

let mockPathname = '/home'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, replace: replaceMock, back: backMock }),
  usePathname: () => mockPathname,
  useSearchParams: () => new URLSearchParams(),
}))

const renderScreen = (ui: React.ReactElement) => render(ui, { wrapper: createWrapper() })

const renderShell = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>, { wrapper: createWrapper() })

const addOfferToCart = () =>
  useCartStore.getState().add({
    id: 'oferta-1',
    title: 'Negocie agora',
    originalDebt: 245000,
    offerPrice: 98000,
  })

const enableV2Flag = () =>
  server.use(http.get('/api/feature-flags/checkoutV2', () => HttpResponse.json({ enabled: true })))

describe('session, route guard and history flows', () => {
  beforeEach(() => {
    pushMock.mockClear()
    replaceMock.mockClear()
    backMock.mockClear()
    mockPathname = '/home'
    useCartStore.getState().clear()
    useSessionStore.setState({ username: null })
    useHistoryStore.setState({ entries: [] })
    server.use(
      http.get('/api/feature-flags/checkoutV2', () => HttpResponse.json({ enabled: false }))
    )
  })

  it('login accepts any credentials and starts a session', async () => {
    const user = userEvent.setup()

    renderScreen(<LoginRoute />)
    await user.type(screen.getByLabelText('Usuário'), 'maria')
    await user.type(screen.getByLabelText('Senha'), 'qualquer-uma')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(useSessionStore.getState().username).toBe('maria')
    expect(pushMock).toHaveBeenCalledWith('/home')
  })

  it('logout clears the session and goes back to the login screen', async () => {
    useSessionStore.setState({ username: 'maria' })
    const user = userEvent.setup()

    renderShell(
      <AppShell>
        <HistoryRoute />
      </AppShell>
    )
    await user.click(screen.getAllByRole('button', { name: 'Sair' })[0])

    expect(useSessionStore.getState().username).toBeNull()
    expect(pushMock).toHaveBeenCalledWith('/login')
  })

  it('route guard redirects to login when there is no active session', async () => {
    mockPathname = '/historico'

    renderShell(
      <AppShell>
        <HistoryRoute />
      </AppShell>
    )

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith('/login'))
  })

  it('pix checkout records the concluded agreement in history', async () => {
    enableV2Flag()
    const user = userEvent.setup()
    addOfferToCart()

    renderScreen(<CheckoutRoute />)
    await screen.findByRole('group', { name: 'Forma de pagamento' })
    await user.click(screen.getByRole('button', { name: 'Confirmar pagamento' }))
    await screen.findByText('Pagamento via Pix')
    await user.click(screen.getByRole('button', { name: 'Concluir' }))

    const entry = useHistoryStore.getState().entries[0]
    expect(entry).toMatchObject({
      id: 'acordo-123',
      method: 'pix',
      titles: ['Negocie agora'],
      total: 98000,
    })
    expect(Date.parse(entry.paidAt)).not.toBeNaN()
  })

  it('boleto checkout records the agreement with the boleto method', async () => {
    enableV2Flag()
    const user = userEvent.setup()
    addOfferToCart()

    renderScreen(<CheckoutRoute />)
    await screen.findByRole('group', { name: 'Forma de pagamento' })
    await user.click(screen.getByRole('radio', { name: /Boleto/ }))
    await user.click(screen.getByRole('button', { name: 'Confirmar pagamento' }))
    await screen.findByText('Pagamento via boleto')
    await user.click(screen.getByRole('button', { name: 'Concluir' }))

    expect(useHistoryStore.getState().entries[0].method).toBe('boleto')
  })

  it('short checkout records a direct agreement in history', async () => {
    const user = userEvent.setup()
    addOfferToCart()

    renderScreen(<CheckoutRoute />)
    await user.click(await screen.findByRole('button', { name: 'Confirmar' }))

    await waitFor(() => expect(useHistoryStore.getState().entries).toHaveLength(1))
    expect(useHistoryStore.getState().entries[0].method).toBe('direct')
  })

  it('canceling the payment dialog does not record anything in history', async () => {
    enableV2Flag()
    const user = userEvent.setup()
    addOfferToCart()

    renderScreen(<CheckoutRoute />)
    await screen.findByRole('group', { name: 'Forma de pagamento' })
    await user.click(screen.getByRole('button', { name: 'Confirmar pagamento' }))
    await screen.findByText('Pagamento via Pix')
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(useHistoryStore.getState().entries).toHaveLength(0)
  })

  it.each([
    ['pix', 'Pix'],
    ['boleto', 'Boleto'],
    ['direct', 'Acordo direto'],
  ] as const)('history screen lists a %s agreement with date and method', (method, label) => {
    useHistoryStore.setState({
      entries: [
        {
          id: 'acordo-1',
          titles: ['Negocie agora'],
          total: 98000,
          method,
          paidAt: '2025-06-15T14:30:00.000Z',
        },
      ],
    })

    renderScreen(<HistoryRoute />)

    expect(screen.getByText('Negocie agora')).toBeInTheDocument()
    expect(screen.getByText(label)).toBeInTheDocument()
    expect(screen.getByText('15/06/2025')).toBeInTheDocument()
    expect(screen.getByText('R$ 980,00')).toBeInTheDocument()
  })

  it('history screen shows an empty state when nothing was paid', () => {
    renderScreen(<HistoryRoute />)

    expect(screen.getByText('Você ainda não pagou nenhum acordo.')).toBeInTheDocument()
  })

  it('profile screen shows the user name and a derived email', () => {
    useSessionStore.setState({ username: 'Joao Silva' })

    renderScreen(<ProfileRoute />)

    expect(screen.getByText('Joao Silva')).toBeInTheDocument()
    expect(screen.getByText('joao.silva@exemplo.com')).toBeInTheDocument()
  })

  it.each([null, '', '   '])('profile uses display fallbacks for username %j', (username) => {
    useSessionStore.setState({ username })
    renderScreen(<ProfileRoute />)

    expect(screen.getByText('?')).toBeInTheDocument()
    expect(screen.getByText('usuario@exemplo.com')).toBeInTheDocument()
  })
})
