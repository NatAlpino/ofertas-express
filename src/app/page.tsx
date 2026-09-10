"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useOffers } from "@/services/hooks";
import { OfferCard } from "@/components/offer-card";

function OffersList() {
  const { data, isPending, isError, refetch } = useOffers();

  if (isPending) {
    return (
      <p role="status" className="py-16 text-center text-ink-soft">
        Carregando ofertas…
      </p>
    );
  }

  if (isError) {
    return (
      <div role="alert" className="py-16 text-center">
        <p className="text-ink">Não foi possível carregar as ofertas.</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-4 rounded-card border-2 border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary-light"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <ul className="grid gap-4">
      {data?.map((offer) => (
        <li key={offer.id}>
          <OfferCard offer={offer} />
        </li>
      ))}
    </ul>
  );
}

function CheckoutSuccessMessage() {
  const searchParams = useSearchParams();

  if (searchParams.get("checkout") !== "sucesso") return null;

  return (
    <p
      role="status"
      className="mb-4 rounded-card border border-success bg-white p-3 text-sm font-medium text-success"
    >
      Acordo confirmado com sucesso!
    </p>
  );
}

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <Suspense fallback={null}>
        <CheckoutSuccessMessage />
      </Suspense>
      <h1 className="mb-1 text-xl font-bold text-ink">Ofertas Express</h1>
      <p className="mb-4 text-sm text-ink-soft">Renegocie com desconto</p>
      <OffersList />
    </main>
  );
}
