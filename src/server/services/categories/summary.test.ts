import { describe, expect, it } from "vitest";

import {
  buildCategoriesSummary,
  getBudgetStatus,
  resolveMonth,
} from "./summary";

const food = {
  id: "cat-food",
  name: "Alimentação",
  color: "#F59E0B",
  kind: "expense" as const,
  icon: null,
  monthlyBudget: "500.00",
};
const home = {
  id: "cat-home",
  name: "Moradia",
  color: "#3B82F6",
  kind: "expense" as const,
  icon: "moradia",
  monthlyBudget: null,
};
const salary = {
  id: "cat-salary",
  name: "Salário",
  color: "#16A34A",
  kind: "income" as const,
  icon: null,
  monthlyBudget: null,
};

describe("getBudgetStatus", () => {
  it("classifies usage thresholds", () => {
    expect(getBudgetStatus(null)).toBe("none");
    expect(getBudgetStatus(0.5)).toBe("ok");
    expect(getBudgetStatus(0.8)).toBe("warning");
    expect(getBudgetStatus(1)).toBe("warning");
    expect(getBudgetStatus(1.01)).toBe("over");
  });
});

describe("buildCategoriesSummary", () => {
  it("computes amount and budget usage per category", () => {
    const summary = buildCategoriesSummary(
      "2026-09",
      [food, home, salary],
      [
        { categoryId: "cat-food", kind: "expense", total: "420.50", count: 7 },
        { categoryId: "cat-home", kind: "expense", total: "1800.00", count: 1 },
        {
          categoryId: "cat-salary",
          kind: "income",
          total: "5000.00",
          count: 1,
        },
      ],
      [
        { categoryId: "cat-food", count: 30 },
        { categoryId: "cat-home", count: 9 },
      ],
    );

    const foodItem = summary.items.find((item) => item.id === "cat-food");
    expect(foodItem).toMatchObject({
      amount: 420.5,
      monthlyBudget: 500,
      monthTransactionCount: 7,
      totalTransactionCount: 30,
      budgetStatus: "warning",
      icon: "alimentacao",
    });
    expect(foodItem?.budgetUsage).toBeCloseTo(0.841, 3);

    const homeItem = summary.items.find((item) => item.id === "cat-home");
    expect(homeItem).toMatchObject({
      budgetUsage: null,
      budgetStatus: "none",
      icon: "moradia",
    });

    expect(summary.totals).toEqual({
      expense: 2220.5,
      income: 5000,
      budget: 500,
      budgetedExpense: 420.5,
    });
  });

  it("ignores transactions whose kind does not match the category", () => {
    const summary = buildCategoriesSummary(
      "2026-09",
      [food],
      [
        { categoryId: "cat-food", kind: "transfer", total: "999.00", count: 1 },
        { categoryId: null, kind: "expense", total: "50.00", count: 1 },
      ],
      [],
    );

    expect(summary.items[0]?.amount).toBe(0);
    expect(summary.items[0]?.budgetStatus).toBe("ok");
  });

  it("marks categories above the budget as over", () => {
    const summary = buildCategoriesSummary(
      "2026-09",
      [food],
      [{ categoryId: "cat-food", kind: "expense", total: "650.00", count: 3 }],
      [],
    );

    expect(summary.items[0]?.budgetStatus).toBe("over");
    expect(summary.items[0]?.budgetUsage).toBeCloseTo(1.3);
  });

  it("sorts by amount desc", () => {
    const summary = buildCategoriesSummary(
      "2026-09",
      [food, home],
      [{ categoryId: "cat-home", kind: "expense", total: "10.00", count: 1 }],
      [],
    );

    expect(summary.items.map((item) => item.id)).toEqual([
      "cat-home",
      "cat-food",
    ]);
  });
});

describe("resolveMonth", () => {
  it("returns a half-open local range for the month", () => {
    const period = resolveMonth("2026-12");

    expect(period.key).toBe("2026-12");
    expect(period.from).toEqual(new Date(2026, 11, 1));
    expect(period.toExclusive).toEqual(new Date(2027, 0, 1));
  });

  it("defaults to the current month", () => {
    const period = resolveMonth(undefined, new Date(2026, 8, 25));

    expect(period.key).toBe("2026-09");
  });
});
