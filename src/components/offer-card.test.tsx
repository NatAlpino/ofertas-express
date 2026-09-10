import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { OfferCard } from '@/components/offer-card'
import { useCartStore } from '@/store/cart'
import type { Offer } from '@/services/types'

const offer: Offer = {
  id: 'oferta-1',
  title: 'Negocie agora',
  originalDebt: 245000,
  offerPrice: 98000,
}

describe('OfferCard', () => {
  it('renders title, debt, offer price and discount badge', () => {
    render(<OfferCard offer={offer} />)

    expect(screen.getByText('Negocie agora')).toBeInTheDocument()
    expect(screen.getByText('Dívida')).toBeInTheDocument()
    expect(screen.getByText('R$ 2.450,00')).toBeInTheDocument()
    expect(screen.getByText('Oferta')).toBeInTheDocument()
    expect(screen.getByText('R$ 980,00')).toBeInTheDocument()
    expect(screen.getByText('-60% off')).toBeInTheDocument()
  })

  it('adds the offer to the cart when clicked', async () => {
    act(() => {
      useCartStore.getState().clear()
    })
    const user = userEvent.setup()
    render(<OfferCard offer={offer} />)

    await user.click(screen.getByRole('button', { name: 'Adicionar ao carrinho: Negocie agora' }))

    expect(useCartStore.getState().items).toHaveLength(1)
    act(() => {
      useCartStore.getState().clear()
    })
  })
})
