import { describe, expect, it } from "vitest";

import type { Insight, InsightKind } from "@/features/insights/types";

import { insightsToNotifications } from "./notifications";

function insight(kind: InsightKind, overrides: Partial<Insight> = {}): Insight {
  return {
    id: `${kind}:2026-05`,
    kind,
    severity: "attention",
    title: "Título",
    reason: "Motivo em uma frase.",
    headline: "Detalhe com o número.",
    impact: 10,
    impactDirection: "none",
    impactPeriod: "one-off",
    impactLabel: "rótulo",
    source: "fonte",
    evidence: [],
    steps: [],
    action: null,
    ...overrides,
  };
}

describe("insightsToNotifications", () => {
  it("notifies only the kinds that ask for action now", () => {
    const notifications = insightsToNotifications(
      [
        insight("budget-overrun"),
        insight("possible-duplicate", { severity: "risk" }),
        insight("category-above-average"),
        insight("new-recurring", { severity: "info" }),
      ],
      "mai 2026",
    );

    expect(notifications.map((item) => item.id)).toEqual([
      "budget-overrun:2026-05",
      "possible-duplicate:2026-05",
    ]);
  });

  // A análise é recalculada a cada leitura: não existe "há 2 horas" para citar.
  it("uses a caption instead of inventing a timestamp", () => {
    const [notification] = insightsToNotifications(
      [insight("budget-overrun")],
      "mai 2026",
    );

    expect(notification?.caption).toBe("análise de mai 2026");
    expect(notification?.createdAt).toBeUndefined();
  });

  it("links to the insights page filtered by the severity", () => {
    const [notification] = insightsToNotifications(
      [insight("possible-duplicate", { severity: "risk" })],
      "mai 2026",
    );

    expect(notification?.href).toBe("/insights?severity=risk");
    expect(notification?.unread).toBe(true);
  });

  it("returns nothing when there is no notifiable insight", () => {
    expect(
      insightsToNotifications([insight("category-above-average")], "mai 2026"),
    ).toEqual([]);
  });
});
