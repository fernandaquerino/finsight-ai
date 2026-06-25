import { describe, expect, it } from "vitest";

import { categoryMap, getCategoryMeta, resolveCategoryKey } from "./categories";

describe("resolveCategoryKey", () => {
  it("resolves supported category aliases", () => {
    expect(resolveCategoryKey("Alimentação")).toBe("alimentacao");
    expect(resolveCategoryKey("outro")).toBe("outros");
  });

  it("falls back to outros for unknown categories", () => {
    expect(resolveCategoryKey("pets")).toBe("pets");
  });
});

describe("getCategoryMeta", () => {
  it("returns stable colors for the same category", () => {
    expect(getCategoryMeta("moradia").color).toBe(categoryMap.moradia.color);
    expect(getCategoryMeta("Moradia").color).toBe(categoryMap.moradia.color);
  });

  it("returns labels for all controlled categories", () => {
    expect(
      Object.values(categoryMap).map((category) => category.label),
    ).toEqual([
      "Educação",
      "Lazer",
      "Transporte",
      "Moradia",
      "Compras",
      "Assinaturas",
      "Alimentação",
      "Restaurantes",
      "Salário",
      "Outros",
      "Pets",
      "Mercado",
      "Saúde",
    ]);
  });
});
