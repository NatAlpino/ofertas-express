'use client'

import Link from 'next/link'
import { useCartStore } from '@/store/cart'
import { formatBRL } from '@/utils/format'

export default function CartPage() {
  const items = useCartStore((state) => state.items)
  const total = useCartStore((state) => state.total)
  const remove = useCartStore((state) => state.remove)

  return (
    <main className="mx-auto flex min-h-[calc(100vh-65px)] max-w-2xl flex-col px-4 py-6">
      <h1 className="mb-1 text-xl font-bold text-ink">Seu carrinho</h1>
      <p className="mb-4 text-sm text-ink-soft">Confira as ofertas que você selecionou.</p>

      {items.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-ink">Seu carrinho está vazio.</p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-card border-2 border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary-light"
          >
            Ver ofertas disponíveis
          </Link>
        </div>
      ) : (
        <>
          <ul className="grid gap-3">
            {items.map((offer) => (
              <li
                key={offer.id}
                className="flex items-center justify-between gap-3 rounded-card border border-border bg-white p-4 shadow-sm"
              >
                <div>
                  <p className="font-semibold text-ink">{offer.title}</p>
                  <p className="text-xs text-ink-soft">Oferta</p>
                  <p className="text-sm font-bold text-primary">{formatBRL(offer.offerPrice)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(offer.id)}
                  aria-label={`Remover ${offer.title}`}
                  className="rounded-full p-2 text-ink-soft transition-colors hover:bg-red-50 hover:text-danger"
                >
                  <svg
                    aria-hidden="true"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-center justify-between">
            <span className="text-base font-semibold text-ink">Total</span>
            <span className="text-lg font-bold text-ink">{formatBRL(total)}</span>
          </div>

          <Link
            href="/checkout"
            className="mt-4 block rounded-card bg-primary px-4 py-3 text-center text-sm font-bold text-white transition-colors hover:bg-primary-dark"
          >
            Ir para o checkout
          </Link>
        </>
      )}
    </main>
  )
}
