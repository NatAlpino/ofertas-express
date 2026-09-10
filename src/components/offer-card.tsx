'use client'

import { useCartStore } from '@/store/cart'
import { discountPercent, formatBRL } from '@/utils/format'
import type { Offer } from '@/services/types'

export function OfferCard({ offer }: { offer: Offer }) {
  const add = useCartStore((state) => state.add)
  const inCart = useCartStore((state) => state.items.some((item) => item.id === offer.id))
  const discount = discountPercent(offer.originalDebt, offer.offerPrice)

  return (
    <article className="rounded-card border border-border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-ink">{offer.title}</h3>
        {discount > 0 && (
          <span className="rounded-full bg-success px-2 py-0.5 text-xs font-bold text-white">
            -{discount}% off
          </span>
        )}
      </div>
      <dl className="mt-2 grid grid-cols-2 gap-2">
        <div>
          <dt className="text-xs text-ink-soft">Dívida</dt>
          <dd className="text-sm text-ink-soft line-through">{formatBRL(offer.originalDebt)}</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-soft">Oferta</dt>
          <dd className="text-base font-bold text-primary">{formatBRL(offer.offerPrice)}</dd>
        </div>
      </dl>
      <button
        type="button"
        onClick={() => add(offer)}
        disabled={inCart}
        aria-label={
          inCart ? `${offer.title} já está no carrinho` : `Adicionar ao carrinho: ${offer.title}`
        }
        className="mt-3 w-full rounded-card border-2 border-primary px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary-light disabled:cursor-default disabled:border-border disabled:text-ink-soft"
      >
        {inCart ? 'No carrinho' : 'Adicionar ao carrinho'}
      </button>
    </article>
  )
}
