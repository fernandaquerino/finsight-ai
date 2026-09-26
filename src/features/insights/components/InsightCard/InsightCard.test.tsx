import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { Insight, InsightSeverity } from "@/features/insights/types";

import { InsightCard, severityConfig } from "./InsightCard";

// Dados fictícios — nunca usar dados financeiros reais em fixtures.
function insight(overrides: Partial<Insight> = {}): Insight {
  return {
    id: "recurring-charges:2026-05",
    kind: "recurring-charges",
    severity: "opportunity",
    title: "Cobranças recorrentes que valem uma revisão",
    reason: "Encontrei 3 cobranças que se repetem todo mês e somam R$ 112,70.",
    headline: "Essas 3 cobranças custam R$ 112,70 por mês.",
    impact: 112.7,
    impactDirection: "savings",
    impactPeriod: "monthly",
    impactLabel: "até R$ 1.352,40/ano",
    source: "Baseado em 9 cobranças repetidas dos últimos 3 meses",
    evidence: [],
    steps: [],
    action: null,
    ...overrides,
  };
}

describe("InsightCard", () => {
  it("renders the title, the reason and the impact label", () => {
    render(<InsightCard insight={insight()} onOpenDetail={vi.fn()} />);

    expect(
      screen.getByText("Cobranças recorrentes que valem uma revisão"),
    ).toBeVisible();
    expect(
      screen.getByText(
        "Encontrei 3 cobranças que se repetem todo mês e somam R$ 112,70.",
      ),
    ).toBeVisible();
    expect(screen.getByText("até R$ 1.352,40/ano")).toBeVisible();
  });

  // Todo número financeiro na UI cita a fonte — é requisito, não enfeite.
  it("always shows the source of the numbers", () => {
    render(<InsightCard insight={insight()} onOpenDetail={vi.fn()} />);

    expect(
      screen.getByText("Baseado em 9 cobranças repetidas dos últimos 3 meses"),
    ).toBeVisible();
  });

  it.each(Object.keys(severityConfig) as InsightSeverity[])(
    "labels the '%s' severity",
    (severity) => {
      render(
        <InsightCard insight={insight({ severity })} onOpenDetail={vi.fn()} />,
      );

      expect(screen.getByText(severityConfig[severity].label)).toBeVisible();
    },
  );

  it("asks for the detail instead of applying anything", async () => {
    const user = userEvent.setup();
    const onOpenDetail = vi.fn();
    const item = insight();

    render(<InsightCard insight={item} onOpenDetail={onOpenDetail} />);

    await user.click(screen.getByRole("button", { name: /ver detalhes/i }));

    expect(onOpenDetail).toHaveBeenCalledWith(item);
  });

  it("renders the feedback buttons", () => {
    render(<InsightCard insight={insight()} onOpenDetail={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Útil" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Não útil" }),
    ).toBeInTheDocument();
  });
});
