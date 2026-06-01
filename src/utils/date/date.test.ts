import { describe, expect, it } from "vitest";
import { getMonthName } from "./date";

describe("getMonthName", () => {
  it("should return the month name in Portuguese with the first letter capitalized", () => {
    const date = new Date("2026-05-01T12:00:00");

    expect(getMonthName(date)).toBe("Maio");
  });

  it("should return Janeiro when date is in January", () => {
    const date = new Date("2026-01-01T12:00:00");

    expect(getMonthName(date)).toBe("Janeiro");
  });

  it("should use the current date when no date is provided", () => {
    const result = getMonthName();

    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});
