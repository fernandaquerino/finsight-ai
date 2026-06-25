import { describe, expect, it } from "vitest";

import { resolvePeriod } from "./period";

describe("resolvePeriod", () => {
  it("defaults to the current month as a half-open range", () => {
    const now = new Date(2026, 5, 24); // 24 Jun 2026 (local)
    const period = resolvePeriod({}, now);

    expect(period.from).toEqual(new Date(2026, 5, 1));
    expect(period.toExclusive).toEqual(new Date(2026, 6, 1));
    expect(period.key).toBe("2026-06-01_2026-06-30");
  });

  it("uses explicit from/to with an inclusive end (exclusive next day)", () => {
    const period = resolvePeriod({ from: "2026-01-01", to: "2026-01-31" });

    expect(period.from).toEqual(new Date(2026, 0, 1));
    expect(period.toExclusive).toEqual(new Date(2026, 1, 1));
    expect(period.key).toBe("2026-01-01_2026-01-31");
  });

  it("does not shift the day due to UTC parsing", () => {
    const period = resolvePeriod({ from: "2026-03-10", to: "2026-03-10" });

    expect(period.from.getDate()).toBe(10);
    expect(period.toExclusive.getDate()).toBe(11);
  });
});
