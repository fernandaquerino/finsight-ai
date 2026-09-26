import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Insight, InsightsSummary } from "@/features/insights/types";

import { InsightsScreen, describeCounts } from "./InsightsScreen";

function renderScreen(initialSeverity: "all" | "risk" = "all") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <InsightsScreen initialSeverity={initialSeverity} />
    </QueryClientProvider>,
  );
}

function jsonResponse(summary: InsightsSummary) {
  return new Response(JSON.stringify({ data: summary }), { status: 200 });
}

// Dados fictícios — nunca usar dados financeiros reais em fixtures.
const recurringCharges: Insight = {
  id: "recurring-charges:2026-05",
  kind: "recurring-charges",
  severity: "opportunity",
  title: "Cobranças recorrentes que valem uma revisão",
  reason: "Encontrei 3 cobranças que se repetem todo mês e somam R$ 112,70.",
  headline:
    "Essas 3 cobranças custam R$ 112,70 por mês — R$ 1.352,40 em um ano.",
  impact: 112.7,
  impactDirection: "savings",
  impactPeriod: "monthly",
  impactLabel: "até R$ 1.352,40/ano",
  source: "Baseado em 9 cobranças repetidas dos últimos 3 meses",
  evidence: [
    {
      description: "Spotify Premium",
      detail: "todo mês desde mar 2026",
      categoryName: "Assinaturas",
      amount: -21.9,
    },
  ],
  steps: ["Confira quais dessas cobranças você ainda usa"],
  action: { label: "Ver lançamentos recorrentes", href: "/transacoes" },
};

const duplicate: Insight = {
  id: "possible-duplicate:2026-05:t1-t2",
  kind: "possible-duplicate",
  severity: "risk",
  title: "Possível duplicidade em lançamento",
  reason: "Encontrei 1 lançamento que pode estar lançado duas vezes.",
  headline: "Um par de lançamentos idênticos aparece em datas próximas.",
  impact: 210,
  impactDirection: "review",
  impactPeriod: "one-off",
  impactLabel: "R$ 210,00 em dúvida",
  source: "Comparação de valor, descrição e data entre lançamentos de mai 2026",
  evidence: [],
  steps: [],
  action: null,
};

const summary: InsightsSummary = {
  month: "2026-05",
  items: [duplicate, recurringCharges],
  counts: { all: 2, risk: 1, opportunity: 1, attention: 0, info: 0 },
  totals: {
    potentialMonthlySavings: 112.7,
    potentialAnnualSavings: 1352.4,
    amountUnderReview: 210,
  },
};

const emptySummary: InsightsSummary = {
  month: "2026-05",
  items: [],
  counts: { all: 0, risk: 0, opportunity: 0, attention: 0, info: 0 },
  totals: {
    potentialMonthlySavings: 0,
    potentialAnnualSavings: 0,
    amountUnderReview: 0,
  },
};

beforeEach(() => {
  window.history.replaceState(null, "", "/insights");
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("describeCounts", () => {
  it("lists each severity in PT-BR with the right plural", () => {
    expect(
      describeCounts({
        all: 5,
        risk: 1,
        opportunity: 2,
        attention: 2,
        info: 0,
      }),
    ).toBe("1 risco, 2 oportunidades e 2 pontos de atenção para revisar.");
  });

  it("says nothing needs attention when there is no insight", () => {
    expect(
      describeCounts({
        all: 0,
        risk: 0,
        opportunity: 0,
        attention: 0,
        info: 0,
      }),
    ).toBe("Nada exige sua atenção neste mês.");
  });
});

describe("InsightsScreen", () => {
  it("renders the AI headline and one card per insight", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(summary)));

    renderScreen();

    expect(screen.getByLabelText("Carregando insights")).toBeInTheDocument();

    expect(
      await screen.findByText("2 observações sobre o seu mês"),
    ).toBeVisible();
    expect(
      screen.getByText("1 risco e 1 oportunidade para revisar."),
    ).toBeVisible();
    expect(
      screen.getByText("Possível duplicidade em lançamento"),
    ).toBeVisible();
    expect(
      screen.getByText("Cobranças recorrentes que valem uma revisão"),
    ).toBeVisible();
  });

  it("annualizes only the recurring savings in the headline metric", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(summary)));

    renderScreen();

    expect(await screen.findByText("R$ 1.352,40/ano")).toBeVisible();
  });

  it("shows the source of every insight card", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(summary)));

    renderScreen();

    expect(
      await screen.findByText(
        "Baseado em 9 cobranças repetidas dos últimos 3 meses",
      ),
    ).toBeVisible();
  });

  it("filters by severity and deep-links the filter", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(summary)));

    renderScreen();

    await user.click(await screen.findByRole("tab", { name: /Riscos/ }));

    expect(
      screen.getByText("Possível duplicidade em lançamento"),
    ).toBeVisible();
    expect(
      screen.queryByText("Cobranças recorrentes que valem uma revisão"),
    ).not.toBeInTheDocument();
    expect(window.location.search).toBe("?severity=risk");
  });

  it("honours the severity from the URL on first render", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(summary)));

    renderScreen("risk");

    expect(
      await screen.findByText("Possível duplicidade em lançamento"),
    ).toBeVisible();
    expect(
      screen.queryByText("Cobranças recorrentes que valem uma revisão"),
    ).not.toBeInTheDocument();
  });

  it("disables a severity filter with no insight", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(summary)));

    renderScreen();

    expect(await screen.findByRole("tab", { name: /Atenção/ })).toBeDisabled();
  });

  it("opens the detail dialog with evidence, steps and source", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(summary)));

    renderScreen();

    const cards = await screen.findAllByRole("button", {
      name: /ver detalhes/i,
    });
    await user.click(cards[1]!);

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText(recurringCharges.headline)).toBeVisible();
    expect(within(dialog).getByText("Spotify Premium")).toBeVisible();
    expect(within(dialog).getByText("Evidências · 1 item")).toBeVisible();
    expect(
      within(dialog).getByText("Confira quais dessas cobranças você ainda usa"),
    ).toBeVisible();
    expect(
      within(dialog).getByRole("link", {
        name: "Ver lançamentos recorrentes",
      }),
    ).toHaveAttribute("href", "/transacoes");
  });

  it("offers a call to action when there is no insight", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse(emptySummary)),
    );

    renderScreen();

    expect(
      await screen.findByText("Nada exige sua atenção este mês"),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Ver transações" }),
    ).toBeInTheDocument();
  });

  it("offers a retry when the request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("", { status: 500 })),
    );

    renderScreen();

    expect(
      await screen.findByText("Não foi possível carregar os insights"),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Tentar novamente" }),
    ).toBeVisible();
  });
});
