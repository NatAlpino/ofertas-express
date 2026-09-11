import { ThemeProvider } from '@mui/material'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'

import { theme } from '@/theme'
import { useCartStore } from '@/stores/cart'
import { AppShell } from '@/components/app-shell'
import { useSessionStore } from '@/stores/session'
import RootRoute from '@/app/page'

const router = { push: vi.fn(), replace: vi.fn() }
let pathname: string | null = '/home'

vi.mock('next/navigation', () => ({
  useRouter: () => router,
  usePathname: () => pathname,
  redirect: (href: string) => {
    throw new Error(`Redirect: ${href}`)
  },
}))

const renderShell = () =>
  render(
    <ThemeProvider theme={theme}>
      <AppShell>
        <p>Page content</p>
      </AppShell>
    </ThemeProvider>
  )

describe('app navigation', () => {
  it('redirects the root route to home', () => {
    expect(() => RootRoute()).toThrow('Redirect: /home')
  })

  beforeEach(() => {
    vi.clearAllMocks()
    pathname = '/home'
    useCartStore.getState().clear()
    useSessionStore.setState({ username: 'maria' })
  })

  afterEach(() => vi.unstubAllGlobals())

  it.each([
    ['/carrinho', 'Seu carrinho'],
    ['/checkout', 'Confirmar acordo'],
    ['/historico', 'Histórico'],
    ['/perfil', 'Perfil'],
    [null, 'Ofertas Express'],
  ])('shows the page title for %s', (route, title) => {
    pathname = route
    renderShell()

    expect(within(screen.getByRole('banner')).getByRole('heading', { name: title })).toBeVisible()
    if (route && route !== '/checkout') {
      expect(
        screen.getByRole('link', { name: route === '/carrinho' ? 'Carrinho' : title })
      ).toHaveClass('Mui-selected')
    }
  })

  it.each([
    [0, 'Carrinho vazio'],
    [1, 'Carrinho com 1 oferta'],
    [2, 'Carrinho com 2 ofertas'],
  ])('announces the cart with %s offers', (count, label) => {
    for (let index = 0; index < count; index++) {
      useCartStore.getState().add({
        id: String(index),
        title: 'Oferta',
        originalDebt: 100,
        offerPrice: 50,
      })
    }
    renderShell()

    expect(screen.getByRole('link', { name: label })).toHaveAttribute('href', '/carrinho')
    expect(screen.getByRole('link', { name: 'Ofertas' })).toHaveClass('Mui-selected')
    expect(screen.getByRole('link', { name: 'Ofertas' })).toHaveAttribute('href', '/home')
    expect(screen.getByRole('status')).toHaveTextContent(count ? String(count) : '')
  })

  it('renders login without navigation or a redirect', () => {
    pathname = '/login'
    useSessionStore.setState({ username: null })
    renderShell()

    expect(screen.getByText('Page content')).toBeVisible()
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    expect(router.replace).not.toHaveBeenCalled()
  })

  it('opens the mobile menu and closes it with Escape or navigation', async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: true,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))
    )
    const user = userEvent.setup()
    renderShell()

    await user.click(screen.getByRole('button', { name: 'Abrir menu' }))
    expect(screen.getByRole('presentation')).toBeVisible()
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('presentation')).not.toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'Abrir menu' }))
    const historyLink = within(screen.getByRole('presentation')).getByRole('link', {
      name: 'Histórico',
    })
    expect(historyLink).toHaveAttribute('href', '/historico')
    historyLink.addEventListener('click', (event) => event.preventDefault())
    await user.click(historyLink)
    await waitFor(() => expect(screen.queryByRole('presentation')).not.toBeInTheDocument())
  })
})
