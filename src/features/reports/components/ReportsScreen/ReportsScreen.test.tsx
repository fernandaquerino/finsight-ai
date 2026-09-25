import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { ReportSummary } from "@/features/reports/types";

import { ReportsScreen } from "./ReportsScreen";

function renderScreen() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ReportsScreen initialGranularity="monthly" initialMonth="2026-05" />
    </QueryClientProvider>,
  );
}

function jsonResponse(report: ReportSummary) {
  return new Response(JSON.stringify({ data: report }), { status: 200 });
}

// Dados fictícios — nunca usar dados financeiros reais em fixtures.
const report: ReportSummary = {
  period: {
    granularity: "monthly",
    key: "2026-05",
    label: "Maio de 2026",
    from: "2026-05-01",
    to: "2026-05-31",
    monthCount: 1,
  },
  income: { value: 8400, deltaPercentage: 5 },
  expenses: { value: 4790, deltaPercentage: -3.4 },
  balance: 3610,
  savingsRate: 3610 / 8400,
  transactionCount: 12,
  largestExpense: { description: "Aluguel", amount: 2350 },
  mostFrequentCategory: { name: "Alimentação", count: 6 },
  series: [{ month: "Mai", receitas: 8400, despesas: 4790 }],
  expenseComposition: [
    {
      id: "cat-home",
      name: "Moradia",
      color: "#534AB7",
      icon: "moradia",
      value: 2350,
      percentage: 49,
      transactionCount: 1,
    },
    {
      id: "cat-food",
      name: "Alimentação",
      color: "#1D9E75",
      icon: "alimentacao",
      value: 1800,
      percentage: 38,
      transactionCount: 6,
    },
  ],
  budgetUsage: [
    {
      id: "cat-food",
      name: "Alimentação",
      color: "#1D9E75",
      amount: 1800,
      budget: 1600,
    },
  ],
  highlight: {
    title: "Resumo de Maio de 2026",
    description: "Você fechou Maio de 2026 com R$ 3.610,00 de sobra.",
    source: "Calculado a partir de 12 transações de Maio de 2026.",
  },
};

const emptyReport: ReportSummary = {
  ...report,
  income: { value: 0, deltaPercentage: null },
  expenses: { value: 0, deltaPercentage: null },
  balance: 0,
  savingsRate: null,
  transactionCount: 0,
  largestExpense: null,
  mostFrequentCategory: null,
  series: [{ month: "Mai", receitas: 0, despesas: 0 }],
  expenseComposition: [],
  budgetUsage: [],
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ReportsScreen", () => {
  it("renders the period metrics with the period-over-period deltas", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(report)));

    renderScreen();

    expect(screen.getByLabelText("Carregando relatório")).toBeInTheDocument();

    const metrics = await screen.findByRole("region", {
      name: "Métricas do período",
    });
    expect(within(metrics).getByText("R$ 8.400,00")).toBeVisible();
    expect(within(metrics).getByText("+5% vs. período anterior")).toBeVisible();
    expect(
      within(metrics).getByText("-3,4% vs. período anterior"),
    ).toBeVisible();
    expect(within(metrics).getByText("Aluguel")).toBeVisible();
    expect(within(metrics).getByText("6 lançamentos")).toBeVisible();
  });

  it("renders the charts, the budget bars and the period summary", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(report)));

    renderScreen();

    expect(await screen.findByText("Receitas vs. despesas")).toBeVisible();
    expect(screen.getByText("Composição de gastos")).toBeVisible();
    expect(screen.getByText("Orçamento por categoria")).toBeVisible();
    expect(screen.getByText("Resumo de Maio de 2026")).toBeVisible();
    expect(
      screen.getByText("Calculado a partir de 12 transações de Maio de 2026."),
    ).toBeVisible();
  });

  it("links both export formats to the current period", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(report)));

    renderScreen();

    const pdf = await screen.findByRole("link", { name: "Gerar PDF" });
    const csv = screen.getByRole("link", { name: "CSV" });

    expect(pdf).toHaveAttribute(
      "href",
      "/api/reports/export?format=pdf&granularity=monthly&month=2026-05",
    );
    expect(csv).toHaveAttribute(
      "href",
      "/api/reports/export?format=csv&granularity=monthly&month=2026-05",
    );
  });

  it("refetches with the chosen granularity", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(report));
    vi.stubGlobal("fetch", fetchMock);

    renderScreen();

    await screen.findByText("Receitas vs. despesas");
    await userEvent.click(screen.getByRole("tab", { name: "Trimestral" }));

    expect(
      fetchMock.mock.calls.some(([url]) =>
        String(url).includes("granularity=quarterly"),
      ),
    ).toBe(true);
    expect(
      screen.getByText("O trimestre é o que contém o mês selecionado."),
    ).toBeVisible();
  });

  it("shows an empty state for a period without movement", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse(emptyReport)),
    );

    renderScreen();

    expect(
      await screen.findByText("Nenhum lançamento em Maio de 2026"),
    ).toBeVisible();
  });

  it("shows a retry action when the request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("", { status: 500 })),
    );

    renderScreen();

    expect(
      await screen.findByText("Não foi possível gerar o relatório"),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Tentar novamente" }),
    ).toBeVisible();
  });
});
