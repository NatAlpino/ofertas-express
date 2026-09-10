'use client'

import { render, screen, act } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Header } from '@/components/header'
import { useCartStore } from '@/store/cart'
import type { Offer } from '@/services/types'

const offer: Offer = {
  id: 'oferta-1',
  title: 'Negocie agora',
  originalDebt: 245000,
  offerPrice: 98000,
}

describe('Header', () => {
  it('shows an accessible empty-cart link when the cart is empty', () => {
    act(() => {
      useCartStore.getState().clear()
    })
    render(<Header />)

    const link = screen.getByRole('link', { name: 'Carrinho vazio' })
    expect(link).toHaveAttribute('href', '/carrinho')
    expect(screen.queryByText('1')).not.toBeInTheDocument()
  })

  it('announces the item count in the badge', () => {
    act(() => {
      useCartStore.getState().clear()
      useCartStore.getState().add(offer)
    })
    render(<Header />)

    expect(
      screen.getByRole('link', {
        name: 'Carrinho com 1 oferta',
      })
    ).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('1')
    act(() => {
      useCartStore.getState().clear()
    })
  })
})
