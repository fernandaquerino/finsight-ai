import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getMonthName, getToday } from "./date";

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

describe("getToday", () => {
  const mockedDate = new Date("2026-05-01T12:00:00");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockedDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("return the current system date", () => {
    expect(getToday()).toEqual(mockedDate);
  });

  it("return an instance of Date", () => {
    expect(getToday()).toBeInstanceOf(Date);
  });
});
