import { describe, expect, it } from "vitest";

import { computeDedupeHash } from "./dedupe";

const base = {
  occurredAt: new Date("2026-06-20T12:00:00.000Z"),
  amount: "28.50",
  description: "Padaria",
  accountId: "11111111-1111-4111-8111-111111111111",
};

describe("computeDedupeHash", () => {
  it("is deterministic for the same input", () => {
    expect(computeDedupeHash(base)).toBe(computeDedupeHash(base));
    expect(computeDedupeHash(base)).toMatch(/^[0-9a-f]{64}$/);
  });

  it("ignores the time component (dedupe is per day)", () => {
    const sameDay = {
      ...base,
      occurredAt: new Date("2026-06-20T23:59:00.000Z"),
    };
    expect(computeDedupeHash(sameDay)).toBe(computeDedupeHash(base));
  });

  it("normalizes amount scale so 28.5 and 28.50 match", () => {
    expect(computeDedupeHash({ ...base, amount: "28.5" })).toBe(
      computeDedupeHash(base),
    );
  });

  it("changes when a field changes", () => {
    expect(computeDedupeHash({ ...base, amount: "29.00" })).not.toBe(
      computeDedupeHash(base),
    );
    expect(computeDedupeHash({ ...base, description: "Mercado" })).not.toBe(
      computeDedupeHash(base),
    );
  });
});
