import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import CartPage from '@/app/carrinho/page'
import { offers } from '@/mocks/data'
import { useCartStore } from '@/stores/cart'

vi.mock('next/navigation', () => ({ useRouter: () => ({ back: vi.fn() }) }))

describe('cart interactions', () => {
  beforeEach(() => {
    useCartStore.getState().clear()
  })

  it('updates the total when removing an offer and shows the empty state after the last removal', async () => {
    const user = userEvent.setup()
    offers.slice(0, 2).forEach((offer) => useCartStore.getState().add(offer))
    render(<CartPage />)

    await user.click(screen.getByRole('button', { name: 'Remover Negocie agora' }))
    expect(screen.queryByText('Negocie agora')).not.toBeInTheDocument()
    expect(useCartStore.getState()).toMatchObject({ count: 1, total: 72000 })

    await user.click(screen.getByRole('button', { name: 'Remover Acordo rápido' }))
    expect(useCartStore.getState()).toMatchObject({ count: 0, total: 0 })
    expect(screen.getByRole('link', { name: /ofertas/i })).toHaveAttribute('href', '/home')
    expect(screen.queryByRole('link', { name: /checkout/i })).not.toBeInTheDocument()
  })
})
