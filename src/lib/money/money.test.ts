import { describe, expect, it } from "vitest";

import { formatMoney, formatSignedMoney } from "./money";

describe("formatMoney", () => {
  it("formats BRL values with pt-BR separators", () => {
    expect(formatMoney(14821.5)).toBe("R$ 14.821,50");
  });

  it("formats negative values", () => {
    expect(formatMoney(-28.5)).toBe("-R$ 28,50");
  });

  it("formats zero values", () => {
    expect(formatMoney(0)).toBe("R$ 0,00");
  });

  it("supports explicit sign display", () => {
    expect(formatMoney(1200, { signDisplay: "always" })).toBe("+R$ 1.200,00");
  });
});

describe("formatSignedMoney", () => {
  it("prefixes positive values with plus sign", () => {
    expect(formatSignedMoney(8400)).toBe("+R$ 8.400,00");
  });

  it("prefixes negative values with minus sign", () => {
    expect(formatSignedMoney(-28.5)).toBe("-R$ 28,50");
  });

  it("does not prefix zero values", () => {
    expect(formatSignedMoney(0)).toBe("R$ 0,00");
  });
});
