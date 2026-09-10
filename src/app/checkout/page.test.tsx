import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import CheckoutPage from "@/app/checkout/page";
import { useCartStore } from "@/store/cart";
import { createWrapper } from "@/tests/utils";
import { server } from "@/mocks/server";
import type { Offer } from "@/services/types";

const pushMock = vi.fn();
const replaceMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
  usePathname: () => "/checkout",
}));

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

function renderCheckout() {
  return render(<CheckoutPage />, { wrapper: createWrapper() });
}

describe("CheckoutPage", () => {
  beforeEach(() => {
    pushMock.mockClear();
    replaceMock.mockClear();
    server.use(
      http.get("/api/feature-flags/checkoutV2", () =>
        HttpResponse.json({ enabled: false }),
      ),
    );
  });

  it("redirects to the cart when the cart is empty", () => {
    act(() => {
      useCartStore.getState().clear();
    });
    renderCheckout();
    expect(replaceMock).toHaveBeenCalledWith("/carrinho");
    expect(screen.queryByText("Confirmar acordo")).not.toBeInTheDocument();
  });

  it("shows the agreement summary with count and total", async () => {
    seedCart();
    renderCheckout();

    expect(screen.getByText("Confirmar acordo")).toBeInTheDocument();
    expect(screen.getByText("Ofertas selecionadas")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("R$ 1.700,00")).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Confirmar" }),
      ).toBeInTheDocument(),
    );
    act(() => {
      useCartStore.getState().clear();
    });
  });

  it("shows the short flow when the flag is off", async () => {
    seedCart();
    renderCheckout();

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Confirmar" }),
      ).toBeInTheDocument(),
    );
    expect(
      screen.queryByRole("group", { name: "Forma de pagamento" }),
    ).not.toBeInTheDocument();
    act(() => {
      useCartStore.getState().clear();
    });
  });

  it("shows payment selection with Pix pre-selected when the flag is on", async () => {
    server.use(
      http.get("/api/feature-flags/checkoutV2", () =>
        HttpResponse.json({ enabled: true }),
      ),
    );
    seedCart();
    renderCheckout();

    const group = await screen.findByRole("group", {
      name: "Forma de pagamento",
    });
    expect(group).toBeInTheDocument();
    const pix = screen.getByRole("radio", { name: /^Pix/ });
    expect(pix).toBeChecked();
    expect(screen.getByRole("radio", { name: /Boleto/ })).not.toBeChecked();
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Confirmar pagamento" }),
      ).toBeInTheDocument(),
    );
    act(() => {
      useCartStore.getState().clear();
    });
  });

  it("confirms successfully, clears the cart and returns home", async () => {
    seedCart();
    const user = userEvent.setup();
    renderCheckout();

    await user.click(await screen.findByRole("button", { name: "Confirmar" }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/?checkout=sucesso"));
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("shows an error and keeps the cart when the API fails", async () => {
    server.use(
      http.post("/api/checkout", () =>
        HttpResponse.json({ message: "Erro no servidor" }, { status: 500 }),
      ),
    );
    seedCart();
    const user = userEvent.setup();
    renderCheckout();

    await user.click(await screen.findByRole("button", { name: "Confirmar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Erro no servidor",
    );
    expect(pushMock).not.toHaveBeenCalled();
    expect(useCartStore.getState().items).toHaveLength(2);
    act(() => {
      useCartStore.getState().clear();
    });
  });
});
