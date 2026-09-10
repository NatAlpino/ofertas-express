import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import CartPage from "@/app/carrinho/page";
import { useCartStore } from "@/store/cart";
import type { Offer } from "@/services/types";

const offerA: Offer = {
  id: "oferta-1",
  title: "Negocie agora",
  originalDebt: 245000,
  offerPrice: 98000,
};

const offerB: Offer = {
  id: "oferta-2",
  title: "Acordo rápido",
  originalDebt: 120000,
  offerPrice: 72000,
};

function seedCart() {
  act(() => {
    const { clear, add } = useCartStore.getState();
    clear();
    add(offerA);
    add(offerB);
  });
}

describe("CartPage", () => {
  it("lists items with prices and the agreement total", () => {
    seedCart();
    render(<CartPage />);

    expect(screen.getByText("Negocie agora")).toBeInTheDocument();
    expect(screen.getByText("Acordo rápido")).toBeInTheDocument();
    expect(screen.getByText("R$ 1.700,00")).toBeInTheDocument();
  });

  it("removes an item and recalculates the total", async () => {
    seedCart();
    const user = userEvent.setup();
    render(<CartPage />);

    await user.click(
      screen.getByRole("button", { name: "Remover Negocie agora" }),
    );

    expect(screen.queryByText("Negocie agora")).not.toBeInTheDocument();
    expect(screen.getAllByText("R$ 720,00").length).toBeGreaterThan(0);
    act(() => {
      useCartStore.getState().clear();
    });
  });

  it("shows an empty state with a way back to the offers", () => {
    act(() => {
      useCartStore.getState().clear();
    });
    render(<CartPage />);

    expect(screen.getByText("Seu carrinho está vazio.")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Ver ofertas disponíveis" }),
    ).toHaveAttribute("href", "/");
  });

  it("navigates to checkout via the CTA", () => {
    seedCart();
    render(<CartPage />);

    const cta = screen.getByRole("link", { name: "Ir para o checkout" });
    expect(cta).toHaveAttribute("href", "/checkout");
    act(() => {
      useCartStore.getState().clear();
    });
  });
});
