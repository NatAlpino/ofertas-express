import { create } from "zustand";
import type { Offer } from "@/services/types";

interface CartState {
  items: Offer[];
  count: number;
  total: number;
  add: (offer: Offer) => void;
  remove: (offerId: string) => void;
  clear: () => void;
}

const emptyCart = { items: [], count: 0, total: 0 };

function withOffer(items: Offer[], offer: Offer) {
  const next = [...items, offer];
  return {
    items: next,
    count: next.length,
    total: next.reduce((total, item) => total + item.offerPrice, 0),
  };
}

export const useCartStore = create<CartState>((set) => ({
  ...emptyCart,
  add: (offer) =>
    set((state) =>
      state.items.some((item) => item.id === offer.id)
        ? state
        : withOffer(state.items, offer),
    ),
  remove: (offerId) =>
    set((state) => {
      const next = state.items.filter((item) => item.id !== offerId);
      return {
        items: next,
        count: next.length,
        total: next.reduce((total, item) => total + item.offerPrice, 0),
      };
    }),
  clear: () => set({ ...emptyCart }),
}));
