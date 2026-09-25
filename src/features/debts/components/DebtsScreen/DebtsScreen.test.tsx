import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { DebtsSummary } from "@/features/debts/types";

import { DebtsScreen } from "./DebtsScreen";

function renderScreen() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <DebtsScreen initialStrategy="avalanche" />
    </QueryClientProvider>,
  );
}

function jsonResponse(summary: DebtsSummary) {
  return new Response(JSON.stringify({ data: summary }), { status: 200 });
}

// Dados fictícios — nunca usar dados financeiros reais em fixtures.
const summary: DebtsSummary = {
  strategy: "avalanche",
  extraMonthly: 0,
  items: [
    {
      id: "debt-card",
      name: "Cartão exemplo",
      kind: "credit_card",
      totalAmount: 4850,
      remainingAmount: 1650,
      paidAmount: 3200,
      monthlyPayment: 550,
      interestRate: 13.9,
      dueDay: 3,
      paidRatio: 3200 / 4850,
      monthlyInterest: 229.35,
      status: "on-track",
      isFocus: true,
    },
    {
      id: "debt-loan",
      name: "Empréstimo exemplo",
      kind: "personal_loan",
      totalAmount: 12000,
      remainingAmount: 7200,
      paidAmount: 4800,
      monthlyPayment: 100,
      interestRate: 4.2,
      dueDay: null,
      paidRatio: 0.4,
      monthlyInterest: 302.4,
      status: "attention",
      isFocus: false,
    },
  ],
  totals: {
    remaining: 8850,
    monthlyPayment: 650,
    monthlyInterest: 531.75,
    debtCount: 2,
  },
  focusDebtName: "Cartão exemplo",
  simulation: { months: 24, totalInterest: 1800, payoffOrder: ["debt-card"] },
  comparison: {
    recommended: "avalanche",
    avalanche: { months: 24, totalInterest: 1800, payoffOrder: ["debt-card"] },
    snowball: { months: 26, totalInterest: 2100, payoffOrder: ["debt-card"] },
    interestSaved: 300,
    monthsSaved: 2,
  },
  recommendation: {
    title: "Priorize Cartão exemplo",
    description:
      "Entre suas dívidas, Cartão exemplo é a que mais custa em juros.",
    source:
      "Simulação avalanche sobre 2 dívidas. Não é aconselhamento financeiro.",
  },
};

const emptySummary: DebtsSummary = {
  ...summary,
  items: [],
  totals: {
    remaining: 0,
    monthlyPayment: 0,
    monthlyInterest: 0,
    debtCount: 0,
  },
  focusDebtName: null,
  recommendation: null,
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("DebtsScreen", () => {
  it("renders metrics, the focus debt and each debt card", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(summary)));

    renderScreen();

    expect(screen.getByLabelText("Carregando dívidas")).toBeInTheDocument();

    // "Cartão exemplo" aparece também na métrica "Prioridade" — o heading
    // identifica o card da dívida sem ambiguidade.
    expect(
      await screen.findByRole("heading", { name: "Cartão exemplo" }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "Empréstimo exemplo" }),
    ).toBeVisible();
    expect(screen.getByText("Foco agora")).toBeVisible();

    const metrics = screen.getByRole("region", {
      name: "Resumo das suas dívidas",
    });
    expect(within(metrics).getByText("R$ 8.850,00")).toBeVisible();
    expect(within(metrics).getByText("maior juro")).toBeVisible();
  });

  it("flags a debt whose payment does not cover the interest", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(summary)));

    renderScreen();

    expect(await screen.findByText("Atenção")).toBeVisible();
    expect(screen.getByText("Em dia")).toBeVisible();
  });

  it("compares both strategies with the disclaimer", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(summary)));

    renderScreen();

    expect(await screen.findByText("Priorize Cartão exemplo")).toBeVisible();
    const table = screen.getByRole("table");
    expect(
      within(table).getByRole("rowheader", { name: /Avalanche/ }),
    ).toBeVisible();
    expect(
      within(table).getByRole("rowheader", { name: /Bola de neve/ }),
    ).toBeVisible();
    expect(within(table).getByText("24 meses")).toBeVisible();
    expect(within(table).getByText("R$ 2.100,00")).toBeVisible();
    expect(
      screen.getByText(/não é aconselhamento financeiro profissional/),
    ).toBeVisible();
  });

  it("refetches with the chosen strategy", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(summary));
    vi.stubGlobal("fetch", fetchMock);

    renderScreen();

    await screen.findByRole("heading", { name: "Cartão exemplo" });
    await userEvent.click(screen.getByRole("tab", { name: "Bola de neve" }));

    expect(
      fetchMock.mock.calls.some(([url]) =>
        String(url).includes("strategy=snowball"),
      ),
    ).toBe(true);
  });

  it("offers a call to action when there is no debt yet", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse(emptySummary)),
    );

    renderScreen();

    expect(
      await screen.findByText("Você ainda não cadastrou dívidas"),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Adicionar dívida" }),
    ).toBeVisible();
  });

  it("shows a retry action when the request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("", { status: 500 })),
    );

    renderScreen();

    expect(
      await screen.findByText("Não foi possível carregar as dívidas"),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Tentar novamente" }),
    ).toBeVisible();
  });
});
