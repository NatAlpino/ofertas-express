"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cart";

export function Header() {
  const count = useCartStore((state) => state.count);

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-white">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <Link href="/" className="leading-tight">
          <span className="block text-lg font-bold text-primary">
            Ofertas Express
          </span>
          <span className="block text-xs text-ink-soft">
            Renegocie com desconto
          </span>
        </Link>
        <Link
          href="/carrinho"
          aria-label={
            count > 0
              ? `Carrinho com ${count} ${count === 1 ? "oferta" : "ofertas"}`
              : "Carrinho vazio"
          }
          className="relative rounded-full p-2 text-primary hover:bg-primary-light"
        >
          <svg
            aria-hidden="true"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          {count > 0 && (
            <span
              role="status"
              aria-live="polite"
              className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-white"
            >
              {count}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
