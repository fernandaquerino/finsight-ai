import { describe, expect, it } from "vitest";

import { aggregateExpenseCategories } from "./category-breakdown";

describe("aggregateExpenseCategories", () => {
  it("returns empty for no expenses", () => {
    expect(aggregateExpenseCategories([])).toEqual([]);
  });

  it("groups by category and computes percentages summing to ~100", () => {
    const slices = aggregateExpenseCategories([
      { categoryName: "Moradia", amount: "600.00" },
      { categoryName: "Moradia", amount: "400.00" },
      { categoryName: "Alimentação", amount: "1000.00" },
    ]);

    const moradia = slices.find((s) => s.name === "Moradia");
    const alimentacao = slices.find((s) => s.name === "Alimentação");

    expect(moradia?.value).toBe(1000);
    expect(alimentacao?.value).toBe(1000);
    expect(moradia?.percentage).toBe(50);
    expect(alimentacao?.percentage).toBe(50);
  });

  it("buckets unknown categories and nulls into Outros", () => {
    const slices = aggregateExpenseCategories([
      { categoryName: "Petshop", amount: "100.00" },
      { categoryName: null, amount: "50.00" },
    ]);

    expect(slices).toHaveLength(1);
    expect(slices[0]?.name).toBe("Outros");
    expect(slices[0]?.value).toBe(150);
  });

  it("keeps the top 5 and merges the remainder into Outros", () => {
    const slices = aggregateExpenseCategories([
      { categoryName: "Moradia", amount: "500.00" },
      { categoryName: "Alimentação", amount: "400.00" },
      { categoryName: "Transporte", amount: "300.00" },
      { categoryName: "Lazer", amount: "200.00" },
      { categoryName: "Saúde", amount: "100.00" },
      { categoryName: "Petshop", amount: "50.00" }, // → Outros
    ]);

    // 5 categorias controladas + Outros (do Petshop).
    expect(slices).toHaveLength(6);
    const outros = slices.find((s) => s.name === "Outros");
    expect(outros?.value).toBe(50);
    // Ordenado por valor desc.
    expect(slices[0]?.name).toBe("Moradia");
  });

  it("assigns a stable color from the app palette", () => {
    const slices = aggregateExpenseCategories([
      { categoryName: "Moradia", amount: "100.00" },
    ]);

    expect(slices[0]?.color).toMatch(/^#/);
  });
});
