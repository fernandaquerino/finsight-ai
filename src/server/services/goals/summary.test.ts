import { describe, expect, it } from "vitest";

import { buildGoalsSummary, monthsUntil, type GoalRow } from "./summary";

// Mês de referência fixo em todos os testes: maio de 2026.
const now = new Date(2026, 4, 15);

function goal(overrides: Partial<GoalRow> = {}): GoalRow {
  return {
    id: "g1",
    name: "Reserva de emergência",
    icon: "shield",
    targetAmount: "24000.00",
    currentAmount: "12400.00",
    monthlyContribution: "1200.00",
    deadline: "2026-12-31",
    ...overrides,
  };
}

describe("monthsUntil", () => {
  it("counts the deadline month itself", () => {
    expect(monthsUntil("2026-05-31", now)).toBe(1);
  });

  it("counts months across the year boundary", () => {
    expect(monthsUntil("2027-03-01", now)).toBe(11);
  });

  it("returns zero or less for a deadline already past", () => {
    expect(monthsUntil("2026-04-30", now)).toBe(0);
    expect(monthsUntil("2026-02-01", now)).toBe(-2);
  });
});

describe("buildGoalsSummary", () => {
  it("derives progress, remaining amount and required contribution", () => {
    const [item] = buildGoalsSummary([goal()], now).items;

    expect(item?.progress).toBeCloseTo(12400 / 24000);
    expect(item?.remainingAmount).toBe(11600);
    // 8 meses até dez/2026 (mai incluído) → 11600 / 8 = 1450.
    expect(item?.projection.monthsToDeadline).toBe(8);
    expect(item?.projection.requiredMonthlyContribution).toBe(1450);
  });

  it("marks a goal as on-track when the contribution covers the deadline", () => {
    const [item] = buildGoalsSummary(
      [goal({ monthlyContribution: "1500.00" })],
      now,
    ).items;

    expect(item?.status).toBe("on-track");
    // 11600 / 1500 = 7,73 → 8 meses, contando mai como o primeiro.
    expect(item?.projection.monthsToTarget).toBe(8);
    expect(item?.projection.estimatedCompletion).toBe("2026-12");
  });

  it("marks a goal as attention between 80% and 100% of the required rhythm", () => {
    // Necessário 1450; 1200 é 82,7% disso.
    const [item] = buildGoalsSummary([goal()], now).items;

    expect(item?.status).toBe("attention");
    expect(item?.projection.message).toContain("um pouco abaixo");
  });

  it("marks a goal as behind below 80% of the required rhythm", () => {
    const [item] = buildGoalsSummary(
      [goal({ monthlyContribution: "400.00" })],
      now,
    ).items;

    expect(item?.status).toBe("behind");
    expect(item?.projection.message).toContain("não cobre o prazo");
  });

  it("marks a goal as achieved once the target is reached", () => {
    const [item] = buildGoalsSummary(
      [goal({ currentAmount: "24000.00" })],
      now,
    ).items;

    expect(item?.status).toBe("achieved");
    expect(item?.remainingAmount).toBe(0);
    expect(item?.projection.message).toContain("Meta alcançada");
  });

  it("marks a goal as unplanned without a monthly contribution", () => {
    const [item] = buildGoalsSummary(
      [goal({ monthlyContribution: null })],
      now,
    ).items;

    expect(item?.status).toBe("unplanned");
    expect(item?.projection.monthsToTarget).toBeNull();
    expect(item?.projection.message).toContain("Informe um aporte mensal");
  });

  it("projects a completion month when there is no deadline", () => {
    const [item] = buildGoalsSummary([goal({ deadline: null })], now).items;

    expect(item?.status).toBe("on-track");
    expect(item?.projection.monthsToDeadline).toBeNull();
    expect(item?.projection.requiredMonthlyContribution).toBeNull();
    // 11600 / 1200 = 9,67 → 10 meses a partir de maio.
    expect(item?.projection.estimatedCompletion).toBe("2027-02");
  });

  it("flags a deadline that has already passed as behind", () => {
    const [item] = buildGoalsSummary(
      [goal({ deadline: "2026-03-31" })],
      now,
    ).items;

    expect(item?.status).toBe("behind");
    expect(item?.projection.message).toContain("O prazo já passou");
  });

  it("aggregates totals and sorts by progress", () => {
    const summary = buildGoalsSummary(
      [
        goal({
          id: "a",
          name: "Notebook",
          targetAmount: "7500.00",
          currentAmount: "1100.00",
          monthlyContribution: "400.00",
        }),
        goal({
          id: "b",
          name: "Reserva",
          targetAmount: "24000.00",
          currentAmount: "12400.00",
          monthlyContribution: "1200.00",
        }),
      ],
      now,
    );

    expect(summary.items.map((item) => item.id)).toEqual(["b", "a"]);
    expect(summary.totals.saved).toBe(13500);
    expect(summary.totals.target).toBe(31500);
    expect(summary.totals.monthlyContribution).toBe(1600);
    expect(summary.totals.goalCount).toBe(2);
    expect(summary.totals.averageProgress).toBeCloseTo(13500 / 31500);
  });

  it("returns empty totals without goals", () => {
    const summary = buildGoalsSummary([], now);

    expect(summary.items).toEqual([]);
    expect(summary.totals.averageProgress).toBeNull();
  });
});
