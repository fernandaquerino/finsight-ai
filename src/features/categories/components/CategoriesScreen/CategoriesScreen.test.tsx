import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { CategoriesSummary } from "@/features/categories/types";

import { CategoriesScreen, toSpendSlices } from "./CategoriesScreen";

function renderScreen() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <CategoriesScreen initialMonth="2026-09" />
    </QueryClientProvider>,
  );
}

function summaryResponse(summary: CategoriesSummary) {
  return new Response(JSON.stringify({ data: summary }), { status: 200 });
}

// Dados fictícios — nunca usar dados financeiros reais em fixtures.
const summary: CategoriesSummary = {
  month: "2026-09",
  items: [
    {
      id: "cat-food",
      name: "Alimentação",
      color: "#F59E0B",
      kind: "expense",
      icon: "alimentacao",
      monthlyBudget: 500,
      amount: 650,
      monthTransactionCount: 8,
      totalTransactionCount: 40,
      budgetUsage: 1.3,
      budgetStatus: "over",
    },
    {
      id: "cat-outros",
      name: "Outros",
      color: "#94A3B8",
      kind: "expense",
      icon: "outros",
      monthlyBudget: null,
      amount: 20,
      monthTransactionCount: 1,
      totalTransactionCount: 3,
      budgetUsage: null,
      budgetStatus: "none",
    },
    {
      id: "cat-salary",
      name: "Salário",
      color: "#16A34A",
      kind: "income",
      icon: "salario",
      monthlyBudget: null,
      amount: 5000,
      monthTransactionCount: 1,
      totalTransactionCount: 9,
      budgetUsage: null,
      budgetStatus: "none",
    },
  ],
  totals: { expense: 670, income: 5000, budget: 500, budgetedExpense: 650 },
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CategoriesScreen", () => {
  it("renders expense cards with budget usage", async () => {
    const fetchMock = vi.fn().mockResolvedValue(summaryResponse(summary));
    vi.stubGlobal("fetch", fetchMock);

    renderScreen();

    expect(screen.getByLabelText("Carregando categorias")).toBeInTheDocument();

    const card = await screen.findByRole("article", { name: "Alimentação" });
    expect(within(card).getByText("130% de R$ 500,00")).toBeInTheDocument();
    expect(within(card).getByText("R$ 150,00 acima")).toBeInTheDocument();
    expect(
      screen.queryByRole("article", { name: "Salário" }),
    ).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/categories/summary?month=2026-09",
      expect.any(Object),
    );
  });

  it("switches to income categories", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(summaryResponse(summary)));

    renderScreen();
    await screen.findByRole("article", { name: "Alimentação" });

    await user.click(screen.getByRole("tab", { name: "Receitas" }));

    expect(
      screen.getByRole("article", { name: "Salário" }),
    ).toBeInTheDocument();
  });

  it("does not offer deleting the fallback category", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(summaryResponse(summary)));

    renderScreen();
    await user.click(
      await screen.findByRole("button", { name: "Ações da categoria Outros" }),
    );

    expect(
      await screen.findByRole("menuitem", { name: "Editar" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("menuitem", { name: "Excluir" }),
    ).not.toBeInTheDocument();
  });

  it("renders the empty state with a create action", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        summaryResponse({
          month: "2026-09",
          items: [],
          totals: { expense: 0, income: 0, budget: 0, budgetedExpense: 0 },
        }),
      ),
    );

    renderScreen();

    expect(
      await screen.findByText("Nenhuma categoria de despesa"),
    ).toBeInTheDocument();
  });

  it("renders the spend composition panel for the active kind", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(summaryResponse(summary)));

    renderScreen();

    const panel = await screen.findByRole("region", {
      name: "Composição de gastos",
    });
    expect(within(panel).getByText("R$ 670,00 no mês")).toBeInTheDocument();
    expect(within(panel).getByText("Alimentação")).toBeInTheDocument();
    expect(within(panel).getByText("97%")).toBeInTheDocument();
    // Receitas não entram na composição de gastos.
    expect(within(panel).queryByText("Salário")).not.toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Receitas" }));

    expect(
      screen.getByRole("region", { name: "Composição das receitas" }),
    ).toBeInTheDocument();
  });

  it("keeps the budget panel visible next to the composition chart", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(summaryResponse(summary)));

    renderScreen();

    const panel = await screen.findByRole("region", {
      name: "Orçamento por categoria",
    });
    // A barra é aria-hidden; a fonte acessível é a tabela sr-only.
    const row = within(panel).getByRole("row", { name: /Alimentação/ });
    expect(within(row).getByText("R$ 650,00")).toBeInTheDocument();
    expect(within(row).getByText("R$ 500,00")).toBeInTheDocument();
    expect(within(row).getByText("130%")).toBeInTheDocument();
  });

  it("edits budget limits in bulk and only sends what changed", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockImplementation((url: string) =>
      url.startsWith("/api/categories/budgets")
        ? Promise.resolve(
            new Response(JSON.stringify({ data: { updated: 1 } }), {
              status: 200,
            }),
          )
        : Promise.resolve(summaryResponse(summary)),
    );
    vi.stubGlobal("fetch", fetchMock);

    renderScreen();

    await user.click(
      await screen.findByRole("button", { name: "Editar limites" }),
    );

    const dialog = await screen.findByRole("dialog");
    // "Outros" não tem limite hoje e fica intocada — não deve ir no payload.
    expect(within(dialog).getByLabelText("Outros")).toHaveValue("");

    const food = within(dialog).getByLabelText("Alimentação");
    await user.clear(food);
    await user.type(food, "700,00");
    await user.click(
      within(dialog).getByRole("button", { name: "Salvar limites" }),
    );

    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/categories/budgets",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({
            budgets: [{ id: "cat-food", monthlyBudget: 700 }],
          }),
        }),
      );
    });
  });

  it("renders the error state when the API fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 500 })),
    );

    renderScreen();

    expect(
      await screen.findByText("Não foi possível carregar as categorias"),
    ).toBeInTheDocument();
  });
});

describe("toSpendSlices", () => {
  it("keeps only the matching kind with movement and ranks by amount", () => {
    expect(toSpendSlices(summary.items, "expense")).toEqual([
      {
        id: "cat-food",
        name: "Alimentação",
        value: 650,
        percentage: 97,
        color: "#F59E0B",
      },
      {
        id: "cat-outros",
        name: "Outros",
        value: 20,
        percentage: 3,
        color: "#94A3B8",
      },
    ]);
  });

  it("returns no slices when nothing moved in the month", () => {
    const idle = summary.items.map((item) => ({ ...item, amount: 0 }));

    expect(toSpendSlices(idle, "expense")).toEqual([]);
  });
});
