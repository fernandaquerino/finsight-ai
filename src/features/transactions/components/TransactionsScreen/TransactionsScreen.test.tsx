import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TransactionsScreen } from "./TransactionsScreen";

function renderScreen() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <TransactionsScreen />
    </QueryClientProvider>,
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
  window.history.replaceState(null, "", "/");
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

    renderScreen();

    expect(screen.getByLabelText("Carregando tela")).toHaveAttribute(
      "aria-busy",
      "true",
    );

    expect(await screen.findByText("Padaria Sao Jorge")).toBeInTheDocument();
    expect(screen.getByText("Mostrando 1 de 1")).toBeVisible();
    // "Manual" e "Extrato" são chips de filtro por origem (não links).
    expect(screen.getByRole("button", { name: "Manual" })).toBeVisible();
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

    renderScreen();

    expect(
      await screen.findByText("Nenhuma transação cadastrada"),
    ).toBeInTheDocument();
  });

  it("renders an error state when the API fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 500 })),
    );

    renderScreen();

    await waitFor(() => {
      expect(
        screen.getByText("Não foi possível carregar as transações"),
      ).toBeInTheDocument();
    });
  });

  it("syncs filters with the URL and API query", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: { items: [], total: 0, page: 1, hasNext: false },
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    window.history.replaceState(null, "", "/transacoes?kind=expense");

    renderScreen();

    await screen.findByText("Nenhum resultado encontrado");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/transactions?page=1&limit=40&kind=expense",
      expect.any(Object),
    );

    await user.click(screen.getByRole("button", { name: "Receitas" }));

    await waitFor(() => {
      expect(window.location.search).toContain("kind=income");
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/transactions?page=1&limit=40&kind=income",
      expect.any(Object),
    );
  });
});
