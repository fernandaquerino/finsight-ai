import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { appRoutes } from "@/lib/app-routes";
import { TransactionsScreen } from "./TransactionsScreen";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("TransactionsScreen", () => {
  it("renders loading state and then grouped transactions from the API", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            data: {
              items: [
                {
                  id: "tx-1",
                  description: "Padaria Sao Jorge",
                  amount: "28.50",
                  currency: "BRL",
                  kind: "expense",
                  occurredAt: new Date().toISOString(),
                  origin: "import",
                  category: {
                    id: "cat-1",
                    name: "Alimentacao",
                    color: "#20a077",
                  },
                  account: {
                    id: "acc-1",
                    name: "Nubank",
                  },
                },
              ],
              total: 1,
              page: 1,
              hasNext: false,
            },
          }),
          { status: 200 },
        ),
      ),
    );

    render(<TransactionsScreen />);

    expect(screen.getByLabelText("Carregando tela")).toHaveAttribute(
      "aria-busy",
      "true",
    );

    expect(await screen.findByText("Padaria Sao Jorge")).toBeInTheDocument();
    expect(screen.getByText("Mostrando 1 de 1 transações.")).toBeVisible();
    expect(
      screen.getByRole("link", { name: /Nova transação/ }),
    ).toHaveAttribute("href", appRoutes.manualEntry);
  });

  it("renders an empty state when the API has no items", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            data: { items: [], total: 0, page: 1, hasNext: false },
          }),
          { status: 200 },
        ),
      ),
    );

    render(<TransactionsScreen />);

    expect(
      await screen.findByText("Nenhuma transação cadastrada"),
    ).toBeInTheDocument();
  });

  it("renders an error state when the API fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 500 })),
    );

    render(<TransactionsScreen />);

    await waitFor(() => {
      expect(
        screen.getByText("Não foi possível carregar as transações"),
      ).toBeInTheDocument();
    });
  });
});
