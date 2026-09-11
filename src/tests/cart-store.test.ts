import { beforeEach, describe, expect, it } from 'vitest'

import { useCartStore } from '@/stores/cart'

import type { Offer } from '@/types'

const offerA: Offer = {
  id: 'oferta-1',
  title: 'Negocie agora',
  originalDebt: 245000,
  offerPrice: 98000,
}

const offerB: Offer = {
  id: 'oferta-2',
  title: 'Acordo rápido',
  originalDebt: 120000,
  offerPrice: 72000,
}

describe('cart store', () => {
  beforeEach(() => {
    useCartStore.getState().clear()
  })

  it('does not duplicate an offer already in the cart', () => {
    useCartStore.getState().add(offerA)
    useCartStore.getState().add(offerA)
    expect(useCartStore.getState().items).toHaveLength(1)
  })

  it('removes an offer and recalculates the total', () => {
    useCartStore.getState().add(offerA)
    useCartStore.getState().add(offerB)
    expect(useCartStore.getState().total).toBe(170000)

    useCartStore.getState().remove('oferta-1')
    expect(useCartStore.getState().items).toHaveLength(1)
    expect(useCartStore.getState().total).toBe(72000)
  })
})
