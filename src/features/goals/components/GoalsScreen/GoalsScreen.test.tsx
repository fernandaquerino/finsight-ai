import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { GoalsSummary } from "@/features/goals/types";

import { GoalsScreen } from "./GoalsScreen";

function renderScreen() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <GoalsScreen />
    </QueryClientProvider>,
  );
}

function jsonResponse(summary: GoalsSummary) {
  return new Response(JSON.stringify({ data: summary }), { status: 200 });
}

// Dados fictícios — nunca usar dados financeiros reais em fixtures.
const summary: GoalsSummary = {
  items: [
    {
      id: "goal-reserve",
      name: "Reserva de emergência",
      icon: "shield",
      targetAmount: 24000,
      currentAmount: 12400,
      remainingAmount: 11600,
      monthlyContribution: 1500,
      deadline: "2026-12-31",
      progress: 12400 / 24000,
      status: "on-track",
      projection: {
        monthsToTarget: 8,
        estimatedCompletion: "2026-12",
        monthsToDeadline: 8,
        requiredMonthlyContribution: 1450,
        message:
          "Faltam R$ 11.600,00. No ritmo atual você está dentro do prazo.",
      },
    },
    {
      id: "goal-laptop",
      name: "Novo notebook",
      icon: "laptop",
      targetAmount: 7500,
      currentAmount: 1100,
      remainingAmount: 6400,
      monthlyContribution: 400,
      deadline: "2026-09-30",
      progress: 1100 / 7500,
      status: "behind",
      projection: {
        monthsToTarget: 16,
        estimatedCompletion: "2027-08",
        monthsToDeadline: 5,
        requiredMonthlyContribution: 1280,
        message: "Faltam R$ 6.400,00 e o ritmo atual não cobre o prazo.",
      },
    },
  ],
  totals: {
    saved: 13500,
    target: 31500,
    monthlyContribution: 1900,
    goalCount: 2,
    onTrackCount: 1,
    averageProgress: 13500 / 31500,
  },
};

const emptySummary: GoalsSummary = {
  items: [],
  totals: {
    saved: 0,
    target: 0,
    monthlyContribution: 0,
    goalCount: 0,
    onTrackCount: 0,
    averageProgress: null,
  },
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("GoalsScreen", () => {
  it("renders the metrics and one card per goal", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(summary)));

    renderScreen();

    expect(screen.getByLabelText("Carregando metas")).toBeInTheDocument();

    expect(await screen.findByText("Reserva de emergência")).toBeVisible();
    expect(screen.getByText("Novo notebook")).toBeVisible();

    const metrics = screen.getByRole("region", {
      name: "Resumo das suas metas",
    });
    expect(within(metrics).getByText("R$ 13.500,00")).toBeVisible();
    expect(within(metrics).getByText("de R$ 31.500,00")).toBeVisible();
    expect(within(metrics).getByText("1 no ritmo")).toBeVisible();
    // 13500 / 31500 = 42,86% → 43%.
    expect(within(metrics).getByText("43%")).toBeVisible();
  });

  it("shows the status badge and the deterministic projection of each goal", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(summary)));

    renderScreen();

    expect(await screen.findByText("No ritmo")).toBeVisible();
    expect(screen.getByText("Atrasada")).toBeVisible();
    expect(
      screen.getByText("Faltam R$ 6.400,00 e o ritmo atual não cobre o prazo."),
    ).toBeVisible();
    expect(screen.getByText("52% concluído")).toBeVisible();
  });

  it("carries the disclaimer that projections are estimates", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(summary)));

    renderScreen();

    expect(
      await screen.findByText(/não são aconselhamento financeiro profissional/),
    ).toBeVisible();
  });

  it("offers a call to action when there is no goal yet", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse(emptySummary)),
    );

    renderScreen();

    expect(await screen.findByText("Você ainda não tem metas")).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Criar primeira meta" }),
    ).toBeVisible();
  });

  it("opens the form dialog from the empty state", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse(emptySummary)),
    );

    renderScreen();

    await userEvent.click(
      await screen.findByRole("button", { name: "Criar primeira meta" }),
    );

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Nova meta")).toBeVisible();
    expect(within(dialog).getByLabelText(/Valor-alvo/)).toBeVisible();
  });

  it("shows a retry action when the request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("", { status: 500 })),
    );

    renderScreen();

    expect(
      await screen.findByText("Não foi possível carregar as metas"),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Tentar novamente" }),
    ).toBeVisible();
  });
});
