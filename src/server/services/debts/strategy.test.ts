import { describe, expect, it } from "vitest";

import {
  compareStrategies,
  monthlyInterestEstimate,
  orderByStrategy,
  simulatePayoff,
  type SimulationDebt,
} from "./strategy";

const debts: SimulationDebt[] = [
  // Juro alto, saldo pequeno.
  {
    id: "card",
    remainingAmount: 1650,
    interestRate: 13.9,
    monthlyPayment: 550,
  },
  { id: "loan", remainingAmount: 7200, interestRate: 4.2, monthlyPayment: 680 },
  {
    id: "car",
    remainingAmount: 22400,
    interestRate: 1.9,
    monthlyPayment: 1180,
  },
  // Saldo menor que o do cartão, juro intermediário.
  { id: "cdc", remainingAmount: 1400, interestRate: 8.5, monthlyPayment: 320 },
];

describe("orderByStrategy", () => {
  it("orders by highest interest rate under avalanche", () => {
    expect(orderByStrategy(debts, "avalanche").map((d) => d.id)).toEqual([
      "card",
      "cdc",
      "loan",
      "car",
    ]);
  });

  it("orders by smallest remaining balance under snowball", () => {
    expect(orderByStrategy(debts, "snowball").map((d) => d.id)).toEqual([
      "cdc",
      "card",
      "loan",
      "car",
    ]);
  });

  it("breaks ties deterministically by id", () => {
    const tied: SimulationDebt[] = [
      { id: "b", remainingAmount: 100, interestRate: 2, monthlyPayment: 10 },
      { id: "a", remainingAmount: 100, interestRate: 2, monthlyPayment: 10 },
    ];

    expect(orderByStrategy(tied, "avalanche").map((d) => d.id)).toEqual([
      "a",
      "b",
    ]);
    expect(orderByStrategy(tied, "snowball").map((d) => d.id)).toEqual([
      "a",
      "b",
    ]);
  });
});

describe("monthlyInterestEstimate", () => {
  it("sums the interest each debt accrues in one month", () => {
    // 1650*0,139 + 7200*0,042 + 22400*0,019 + 1400*0,085
    expect(monthlyInterestEstimate(debts)).toBeCloseTo(
      229.35 + 302.4 + 425.6 + 119,
      2,
    );
  });

  it("returns zero without debts", () => {
    expect(monthlyInterestEstimate([])).toBe(0);
  });
});

describe("simulatePayoff", () => {
  it("clears every debt and reports the payoff order", () => {
    const result = simulatePayoff(debts, "avalanche");

    expect(result.months).not.toBeNull();
    expect(result.payoffOrder).toHaveLength(4);
    // A dívida de maior juro é atacada primeiro sob avalanche.
    expect(result.payoffOrder[0]).toBe("card");
    expect(result.totalInterest).toBeGreaterThan(0);
  });

  it("clears the smallest balance first under snowball", () => {
    expect(simulatePayoff(debts, "snowball").payoffOrder[0]).toBe("cdc");
  });

  it("costs less interest under avalanche than under snowball", () => {
    const avalanche = simulatePayoff(debts, "avalanche");
    const snowball = simulatePayoff(debts, "snowball");

    expect(avalanche.totalInterest).toBeLessThanOrEqual(snowball.totalInterest);
  });

  it("finishes sooner with an extra monthly contribution", () => {
    const base = simulatePayoff(debts, "avalanche");
    const boosted = simulatePayoff(debts, "avalanche", 300);

    expect(boosted.months).not.toBeNull();
    expect(base.months).not.toBeNull();
    expect(boosted.months!).toBeLessThanOrEqual(base.months!);
    expect(boosted.totalInterest).toBeLessThan(base.totalInterest);
  });

  it("returns months null when the budget does not cover the interest", () => {
    const hopeless: SimulationDebt[] = [
      { id: "x", remainingAmount: 10000, interestRate: 15, monthlyPayment: 50 },
    ];

    expect(simulatePayoff(hopeless, "avalanche").months).toBeNull();
  });

  it("returns months null when there is no budget at all", () => {
    const noPayment: SimulationDebt[] = [
      { id: "x", remainingAmount: 500, interestRate: 0, monthlyPayment: 0 },
    ];

    expect(simulatePayoff(noPayment, "avalanche").months).toBeNull();
  });

  it("handles an interest-free debt exactly", () => {
    const free: SimulationDebt[] = [
      { id: "x", remainingAmount: 1000, interestRate: 0, monthlyPayment: 250 },
    ];
    const result = simulatePayoff(free, "avalanche");

    expect(result.months).toBe(4);
    expect(result.totalInterest).toBe(0);
  });

  it("returns a finished simulation when nothing is owed", () => {
    expect(simulatePayoff([], "avalanche")).toEqual({
      months: 0,
      totalInterest: 0,
      payoffOrder: [],
    });
  });
});

describe("compareStrategies", () => {
  it("recommends avalanche and quantifies the interest saved", () => {
    const comparison = compareStrategies(debts);

    expect(comparison.recommended).toBe("avalanche");
    expect(comparison.interestSaved).toBeGreaterThanOrEqual(0);
    expect(comparison.interestSaved).toBeCloseTo(
      comparison.snowball.totalInterest - comparison.avalanche.totalInterest,
      2,
    );
  });

  it("reports monthsSaved as null when one strategy never finishes", () => {
    const hopeless: SimulationDebt[] = [
      { id: "x", remainingAmount: 10000, interestRate: 15, monthlyPayment: 50 },
    ];

    expect(compareStrategies(hopeless).monthsSaved).toBeNull();
  });
});
