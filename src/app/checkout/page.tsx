"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PaymentSelector } from "@/components/payment-selector";
import { useCartStore } from "@/store/cart";
import { useCheckoutFlag, useConfirmCheckout } from "@/services/hooks";
import { formatBRL } from "@/utils/format";
import type { PaymentMethod } from "@/services/types";

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const count = useCartStore((state) => state.count);
  const total = useCartStore((state) => state.total);
  const clear = useCartStore((state) => state.clear);

  const { isPending: isFlagPending, isV2 } = useCheckoutFlag();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");

  const {
    mutate: confirmCheckout,
    isPending: isSubmitting,
    isError,
    error,
    reset,
  } = useConfirmCheckout();

  const isEmpty = count === 0;

  useEffect(() => {
    if (isEmpty) router.replace("/carrinho");
  }, [isEmpty, router]);

  useEffect(() => {
    reset();
  }, [paymentMethod, reset]);

  if (isEmpty) return null;

  const handleConfirm = () => {
    confirmCheckout(
      {
        offerIds: items.map((offer) => offer.id),
        ...(isV2 ? { paymentMethod } : {}),
      },
      {
        onSuccess: () => {
          clear();
          router.push("/?checkout=sucesso");
        },
      },
    );
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-65px)] max-w-2xl flex-col px-4 py-6">
      <Link
        href="/carrinho"
        aria-label="Voltar para o carrinho"
        className="mb-2 inline-flex w-fit items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        ← Voltar
      </Link>
      <h1 className="mb-1 text-xl font-bold text-ink">Confirmar acordo</h1>
      <p className="mb-4 text-sm text-ink-soft">
        Revise os detalhes e confirme para seguir.
      </p>

      <dl className="grid gap-3 rounded-card border border-border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <dt className="text-sm text-ink-soft">Ofertas selecionadas</dt>
          <dd className="text-sm font-semibold text-ink">{count}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-sm text-ink-soft">Total do acordo</dt>
          <dd className="text-base font-bold text-ink">{formatBRL(total)}</dd>
        </div>
      </dl>

      {isFlagPending ? (
        <p role="status" className="py-8 text-center text-ink-soft">
          Carregando checkout…
        </p>
      ) : (
        <>
          {isV2 && (
            <PaymentSelector value={paymentMethod} onChange={setPaymentMethod} />
          )}

          {isError && (
            <p role="alert" className="mt-4 rounded-card border border-danger bg-white p-3 text-sm font-medium text-danger">
              {error instanceof Error
                ? error.message
                : "Não foi possível confirmar o acordo. Tente novamente."}
            </p>
          )}

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="mt-6 rounded-card bg-primary px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
          >
            {isSubmitting
              ? "Confirmando…"
              : isV2
                ? "Confirmar pagamento"
                : "Confirmar"}
          </button>
        </>
      )}
    </main>
  );
}
