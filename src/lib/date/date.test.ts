import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  formatRelativeTime,
  getMonthAndYear,
  getMonthName,
  getToday,
  getYear,
} from "./date";

describe("getMonthName", () => {
  it("return the month name in Portuguese with the first letter capitalized", () => {
    const date = new Date("2026-05-01T12:00:00");

    expect(getMonthName(date)).toBe("Maio");
  });

  it("return Janeiro when date is in January", () => {
    const date = new Date("2026-01-01T12:00:00");

    expect(getMonthName(date)).toBe("Janeiro");
  });

  it("use the current date when no date is provided", () => {
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

describe("getYear", () => {
  it("return the year from date", () => {
    const date = new Date("2026-06-01T12:00:00");

    expect(getYear(date)).toBe(2026);
  });
});

describe("getMonthAndYear", () => {
  it("return month and year in Portuguese", () => {
    const date = new Date("2026-06-01T12:00:00");

    expect(getMonthAndYear(date)).toBe("Junho de 2026");
  });

  it("return Maio de 2026", () => {
    const date = new Date("2026-05-01T12:00:00");

    expect(getMonthAndYear(date)).toBe("Maio de 2026");
  });
});

describe("formatRelativeTime", () => {
  const now = new Date("2026-06-01T12:00:00");

  it("return agora when the difference is less than one minute", () => {
    const date = new Date("2026-06-01T11:59:30");

    expect(formatRelativeTime(date, now)).toBe("agora");
  });

  it("return minutes when the difference is less than one hour", () => {
    const date = new Date("2026-06-01T11:45:00");

    expect(formatRelativeTime(date, now)).toBe("há 15 min");
  });

  it("return hours when the difference is less than one day", () => {
    const date = new Date("2026-06-01T07:00:00");

    expect(formatRelativeTime(date, now)).toBe("há 5 h");
  });

  it("return singular day when the difference is one day", () => {
    const date = new Date("2026-05-31T12:00:00");

    expect(formatRelativeTime(date, now)).toBe("há 1 dia");
  });

  it("return plural days when the difference is more than one day", () => {
    const date = new Date("2026-05-29T12:00:00");

    expect(formatRelativeTime(date, now)).toBe("há 3 dias");
  });

  it("return agora for future dates", () => {
    const date = new Date("2026-06-01T12:01:00");

    expect(formatRelativeTime(date, now)).toBe("agora");
  });
});
