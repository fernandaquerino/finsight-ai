import { describe, expect, it } from "vitest";

import {
  buildReport,
  percentageChange,
  type ReportCategory,
  type ReportTransaction,
} from "./build-report";
import { resolveReportPeriod } from "./period";

const now = new Date(2026, 4, 15);

const categories: ReportCategory[] = [
  {
    id: "c-food",
    name: "Alimentação",
    color: "#1D9E75",
    kind: "expense",
    icon: "alimentacao",
    monthlyBudget: "1600.00",
  },
  {
    id: "c-home",
    name: "Moradia",
    color: "#534AB7",
    kind: "expense",
    icon: "moradia",
    monthlyBudget: "3200.00",
  },
  {
    id: "c-fun",
    name: "Lazer",
    color: "#D4537E",
    kind: "expense",
    icon: "lazer",
    monthlyBudget: "500.00",
  },
  {
    id: "c-salary",
    name: "Salário",
    color: "#1D9E75",
    kind: "income",
    icon: "salario",
    monthlyBudget: null,
  },
];

function tx(overrides: Partial<ReportTransaction> = {}): ReportTransaction {
  return {
    categoryId: "c-food",
    kind: "expense",
    amount: "100.00",
    description: "Mercado",
    occurredAt: new Date(2026, 4, 10),
    ...overrides,
  };
}

const monthly = resolveReportPeriod("monthly", "2026-05", now);

describe("resolveReportPeriod", () => {
  it("resolves a single month", () => {
    expect(monthly.key).toBe("2026-05");
    expect(monthly.label).toBe("Maio de 2026");
    expect(monthly.monthCount).toBe(1);
    expect(monthly.from).toEqual(new Date(2026, 4, 1));
    expect(monthly.toExclusive).toEqual(new Date(2026, 5, 1));
    // Período anterior de igual duração: abril.
    expect(monthly.previousFrom).toEqual(new Date(2026, 3, 1));
  });

  it("resolves the quarter containing the anchor month", () => {
    const period = resolveReportPeriod("quarterly", "2026-05", now);

    expect(period.key).toBe("2026-Q2");
    expect(period.label).toBe("2º trimestre de 2026");
    expect(period.months.map((month) => month.label)).toEqual([
      "Abr",
      "Mai",
      "Jun",
    ]);
    expect(period.previousFrom).toEqual(new Date(2026, 0, 1));
  });

  it("resolves the whole year", () => {
    const period = resolveReportPeriod("yearly", "2026-05", now);

    expect(period.key).toBe("2026");
    expect(period.months).toHaveLength(12);
    expect(period.previousFrom).toEqual(new Date(2025, 0, 1));
  });

  it("falls back to the current month without an anchor", () => {
    expect(resolveReportPeriod("monthly", undefined, now).key).toBe("2026-05");
  });
});

describe("percentageChange", () => {
  it("computes the change against the previous period", () => {
    expect(percentageChange(11000, 10000)).toBe(10);
    expect(percentageChange(9000, 10000)).toBe(-10);
  });

  it("returns null when the previous period had no movement", () => {
    expect(percentageChange(5000, 0)).toBeNull();
  });
});

describe("buildReport", () => {
  const transactions: ReportTransaction[] = [
    tx({
      amount: "8400.00",
      kind: "income",
      categoryId: "c-salary",
      description: "Salário",
    }),
    tx({ amount: "1800.00", description: "Mercado do mês" }),
    tx({ amount: "2350.00", categoryId: "c-home", description: "Aluguel" }),
    tx({
      amount: "640.00",
      categoryId: "c-fun",
      description: "Cinema e shows",
    }),
    tx({
      amount: "50.00",
      kind: "transfer",
      categoryId: null,
      description: "Entre contas",
    }),
  ];

  const previous: ReportTransaction[] = [
    tx({ amount: "8000.00", kind: "income", categoryId: "c-salary" }),
    tx({ amount: "4000.00" }),
  ];

  const report = buildReport(monthly, transactions, previous, categories);

  it("computes income, expenses and balance ignoring transfers", () => {
    expect(report.income.value).toBe(8400);
    expect(report.expenses.value).toBe(4790);
    expect(report.balance).toBe(3610);
    expect(report.savingsRate).toBeCloseTo(3610 / 8400);
  });

  it("computes deltas against the previous period", () => {
    expect(report.income.deltaPercentage).toBe(5);
    expect(report.expenses.deltaPercentage).toBe(19.8);
  });

  it("identifies the largest expense and the most frequent category", () => {
    expect(report.largestExpense).toEqual({
      description: "Aluguel",
      amount: 2350,
    });
    expect(report.mostFrequentCategory?.count).toBe(1);
  });

  it("builds the expense composition sorted by value with percentages", () => {
    expect(report.expenseComposition.map((slice) => slice.name)).toEqual([
      "Moradia",
      "Alimentação",
      "Lazer",
    ]);
    expect(
      report.expenseComposition.reduce(
        (sum, slice) => sum + slice.percentage,
        0,
      ),
    ).toBeGreaterThanOrEqual(99);
  });

  it("scales the budget by the number of months in the period", () => {
    const quarter = resolveReportPeriod("quarterly", "2026-05", now);
    const quarterReport = buildReport(
      quarter,
      transactions,
      previous,
      categories,
    );
    const food = quarterReport.budgetUsage.find(
      (item) => item.name === "Alimentação",
    );

    expect(food?.budget).toBe(4800);
  });

  it("names the categories that went over budget in the highlight", () => {
    // Lazer estourou (640 de 500) e Alimentação também (1800 de 1600).
    expect(report.highlight.description).toContain("Lazer");
    expect(report.highlight.description).toContain("Alimentação");
    expect(report.highlight.description).toContain("passaram do limite");
    expect(report.highlight.source).toContain("5 transações");
  });

  it("builds one series point per month of the period", () => {
    expect(report.series).toEqual([
      { month: "Mai", receitas: 8400, despesas: 4790 },
    ]);
  });

  it("handles a period without transactions", () => {
    const empty = buildReport(monthly, [], [], categories);

    expect(empty.income.value).toBe(0);
    expect(empty.savingsRate).toBeNull();
    expect(empty.largestExpense).toBeNull();
    expect(empty.mostFrequentCategory).toBeNull();
    expect(empty.expenseComposition).toEqual([]);
    expect(empty.highlight.description).toContain("equilibradas");
  });
});
