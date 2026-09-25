import { describe, expect, it } from "vitest";

import { buildDebtsSummary, type DebtRow } from "./summary";

function debt(overrides: Partial<DebtRow> = {}): DebtRow {
  return {
    id: "card",
    name: "Cartão Nubank",
    kind: "credit_card",
    totalAmount: "4850.00",
    remainingAmount: "1650.00",
    monthlyPayment: "550.00",
    interestRate: "13.900",
    dueDay: 3,
    ...overrides,
  };
}

const rows: DebtRow[] = [
  debt(),
  debt({
    id: "loan",
    name: "Empréstimo Itaú",
    kind: "personal_loan",
    totalAmount: "12000.00",
    remainingAmount: "7200.00",
    monthlyPayment: "680.00",
    interestRate: "4.200",
  }),
  debt({
    id: "car",
    name: "Financiamento do carro",
    kind: "financing",
    totalAmount: "38000.00",
    remainingAmount: "22400.00",
    monthlyPayment: "1180.00",
    interestRate: "1.900",
  }),
];

describe("buildDebtsSummary", () => {
  it("derives paid amount, ratio and monthly interest per debt", () => {
    const [item] = buildDebtsSummary([debt()], "avalanche").items;

    expect(item?.paidAmount).toBe(3200);
    expect(item?.paidRatio).toBeCloseTo(3200 / 4850);
    expect(item?.monthlyInterest).toBeCloseTo(1650 * 0.139, 2);
    expect(item?.status).toBe("on-track");
  });

  it("flags a debt whose payment does not cover the monthly interest", () => {
    const [item] = buildDebtsSummary(
      [debt({ monthlyPayment: "100.00" })],
      "avalanche",
    ).items;

    expect(item?.status).toBe("attention");
  });

  it("puts the highest rate in focus under avalanche", () => {
    const summary = buildDebtsSummary(rows, "avalanche");

    expect(summary.items.map((item) => item.id)).toEqual([
      "card",
      "loan",
      "car",
    ]);
    expect(summary.items[0]?.isFocus).toBe(true);
    expect(summary.focusDebtName).toBe("Cartão Nubank");
  });

  it("puts the smallest balance in focus under snowball", () => {
    const summary = buildDebtsSummary(rows, "snowball");

    expect(summary.items.map((item) => item.id)).toEqual([
      "card",
      "loan",
      "car",
    ]);
    expect(summary.focusDebtName).toBe("Cartão Nubank");
  });

  it("aggregates totals over the open debts only", () => {
    const summary = buildDebtsSummary(
      [...rows, debt({ id: "done", name: "Quitada", remainingAmount: "0.00" })],
      "avalanche",
    );

    expect(summary.totals.debtCount).toBe(3);
    expect(summary.totals.remaining).toBe(31250);
    expect(summary.totals.monthlyPayment).toBe(2410);
    // Dívida quitada vai para o fim e não recebe foco.
    expect(summary.items.at(-1)?.id).toBe("done");
    expect(summary.items.at(-1)?.status).toBe("settled");
  });

  it("builds a recommendation with the focus debt, an estimate and a disclaimer", () => {
    const summary = buildDebtsSummary(rows, "avalanche", 300);

    expect(summary.recommendation?.title).toBe("Priorize Cartão Nubank");
    expect(summary.recommendation?.description).toContain("13,9% a.m.");
    expect(summary.recommendation?.description).toContain("aporte extra");
    expect(summary.recommendation?.source).toContain(
      "Não é aconselhamento financeiro",
    );
    expect(summary.extraMonthly).toBe(300);
  });

  it("explains when the payments never clear the balance", () => {
    const summary = buildDebtsSummary(
      [
        debt({
          remainingAmount: "10000.00",
          monthlyPayment: "50.00",
          interestRate: "15.000",
        }),
      ],
      "avalanche",
    );

    expect(summary.simulation.months).toBeNull();
    expect(summary.recommendation?.description).toContain(
      "o saldo não diminui",
    );
  });

  it("returns an empty summary without debts", () => {
    const summary = buildDebtsSummary([], "avalanche");

    expect(summary.items).toEqual([]);
    expect(summary.totals.remaining).toBe(0);
    expect(summary.focusDebtName).toBeNull();
    expect(summary.recommendation).toBeNull();
  });
});
