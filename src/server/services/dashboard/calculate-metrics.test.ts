import { describe, expect, it } from "vitest";

import { calculateMetrics } from "./calculate-metrics";

describe("calculateMetrics", () => {
  it("returns zeros for no transactions", () => {
    expect(calculateMetrics([])).toEqual({
      income: 0,
      expenses: 0,
      balance: 0,
      savings: 0,
    });
  });

  it("sums income and expenses and derives balance and savings", () => {
    const metrics = calculateMetrics([
      { kind: "income", amount: "5000.00" },
      { kind: "income", amount: "1290.50" },
      { kind: "expense", amount: "1500.00" },
      { kind: "expense", amount: "603.10" },
    ]);

    expect(metrics).toEqual({
      income: 6290.5,
      expenses: 2103.1,
      balance: 4187.4,
      savings: 4187.4,
    });
  });

  it("ignores transfers in income and expense totals", () => {
    const metrics = calculateMetrics([
      { kind: "income", amount: "1000.00" },
      { kind: "transfer", amount: "750.00" },
      { kind: "expense", amount: "200.00" },
    ]);

    expect(metrics.income).toBe(1000);
    expect(metrics.expenses).toBe(200);
    expect(metrics.balance).toBe(800);
  });

  it("clamps savings to zero when expenses exceed income", () => {
    const metrics = calculateMetrics([
      { kind: "income", amount: "1000.00" },
      { kind: "expense", amount: "1500.00" },
    ]);

    expect(metrics.balance).toBe(-500);
    expect(metrics.savings).toBe(0);
  });

  it("avoids floating point drift by summing in cents", () => {
    const metrics = calculateMetrics([
      { kind: "expense", amount: "0.10" },
      { kind: "expense", amount: "0.20" },
    ]);

    // 0.1 + 0.2 === 0.30000000000000004 em float; em centavos dá exato.
    expect(metrics.expenses).toBe(0.3);
  });
});
