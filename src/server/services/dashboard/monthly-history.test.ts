import { describe, expect, it } from "vitest";

import { aggregateMonthly, lastMonths } from "./monthly-history";

describe("lastMonths", () => {
  it("returns the N months ending at `now`, oldest first", () => {
    const buckets = lastMonths(new Date(2026, 5, 15), 6); // Jun 2026

    expect(buckets.map((b) => b.label)).toEqual([
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
    ]);
    expect(buckets[0]).toMatchObject({ year: 2026, monthIndex: 0 });
    expect(buckets[5]).toMatchObject({ year: 2026, monthIndex: 5 });
  });

  it("crosses the year boundary correctly", () => {
    const buckets = lastMonths(new Date(2026, 1, 1), 3); // Feb 2026

    expect(buckets.map((b) => `${b.year}-${b.monthIndex}`)).toEqual([
      "2025-11",
      "2026-0",
      "2026-1",
    ]);
  });
});

describe("aggregateMonthly", () => {
  const buckets = lastMonths(new Date(2026, 2, 1), 3); // Jan, Fev, Mar 2026

  it("buckets income and expenses by month", () => {
    const series = aggregateMonthly(
      [
        {
          occurredAt: new Date(2026, 0, 10),
          kind: "income",
          amount: "1000.00",
        },
        {
          occurredAt: new Date(2026, 0, 20),
          kind: "expense",
          amount: "400.00",
        },
        { occurredAt: new Date(2026, 2, 5), kind: "income", amount: "2000.00" },
        {
          occurredAt: new Date(2026, 2, 6),
          kind: "transfer",
          amount: "999.00",
        },
      ],
      buckets,
    );

    expect(series).toEqual([
      { month: "Jan", receitas: 1000, despesas: 400 },
      { month: "Fev", receitas: 0, despesas: 0 },
      { month: "Mar", receitas: 2000, despesas: 0 },
    ]);
  });

  it("ignores transactions outside the bucket window", () => {
    const series = aggregateMonthly(
      [
        {
          occurredAt: new Date(2025, 11, 31),
          kind: "expense",
          amount: "500.00",
        },
      ],
      buckets,
    );

    expect(series.every((point) => point.despesas === 0)).toBe(true);
  });
});
