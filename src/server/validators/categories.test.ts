import { describe, expect, it } from "vitest";

import {
  categoriesSummaryQuerySchema,
  createCategorySchema,
  updateCategoryBudgetsSchema,
  updateCategorySchema,
} from "./categories";

describe("createCategorySchema", () => {
  it("accepts a valid category and normalizes the color", () => {
    const result = createCategorySchema.parse({
      name: "  Academia ",
      color: "#22c55e",
      icon: "lazer",
      kind: "expense",
      monthlyBudget: 120,
    });

    expect(result).toMatchObject({ name: "Academia", color: "#22C55E" });
  });

  it.each([
    { name: "", color: "#22C55E", icon: "lazer", kind: "expense" },
    { name: "A", color: "red", icon: "lazer", kind: "expense" },
    { name: "A", color: "#22C55E", icon: "rocket", kind: "expense" },
    { name: "A", color: "#22C55E", icon: "lazer", kind: "transfer" },
    {
      name: "A",
      color: "#22C55E",
      icon: "lazer",
      kind: "expense",
      monthlyBudget: 0,
    },
    { name: "x".repeat(41), color: "#22C55E", icon: "lazer", kind: "expense" },
  ])("rejects invalid input %#", (input) => {
    expect(createCategorySchema.safeParse(input).success).toBe(false);
  });
});

describe("updateCategorySchema", () => {
  it("requires at least one field", () => {
    expect(updateCategorySchema.safeParse({}).success).toBe(false);
  });

  it("accepts null budget to clear it", () => {
    expect(updateCategorySchema.parse({ monthlyBudget: null })).toEqual({
      monthlyBudget: null,
    });
  });

  it("does not accept kind changes", () => {
    const result = updateCategorySchema.parse({
      kind: "income",
      color: "#000000",
    });
    expect(result).not.toHaveProperty("kind");
  });
});

describe("categoriesSummaryQuerySchema", () => {
  it("validates YYYY-MM", () => {
    expect(
      categoriesSummaryQuerySchema.safeParse({ month: "2026-09" }).success,
    ).toBe(true);
    expect(
      categoriesSummaryQuerySchema.safeParse({ month: "2026-13" }).success,
    ).toBe(false);
    expect(categoriesSummaryQuerySchema.safeParse({}).success).toBe(true);
  });
});

describe("updateCategoryBudgetsSchema", () => {
  const id = "3f1c5b2a-9d4e-4f8a-b7c6-1e2d3a4b5c6d";
  const other = "7a8b9c0d-1e2f-4a3b-8c7d-6e5f4a3b2c1d";

  it("accepts a list with values and removals", () => {
    const result = updateCategoryBudgetsSchema.parse({
      budgets: [
        { id, monthlyBudget: 1200.5 },
        { id: other, monthlyBudget: null },
      ],
    });

    expect(result.budgets).toHaveLength(2);
    expect(result.budgets[1]?.monthlyBudget).toBeNull();
  });

  it("rejects an empty list", () => {
    expect(updateCategoryBudgetsSchema.safeParse({ budgets: [] }).success).toBe(
      false,
    );
  });

  it("rejects repeated categories", () => {
    expect(
      updateCategoryBudgetsSchema.safeParse({
        budgets: [
          { id, monthlyBudget: 100 },
          { id, monthlyBudget: 200 },
        ],
      }).success,
    ).toBe(false);
  });

  it("rejects a non-positive budget and a malformed id", () => {
    expect(
      updateCategoryBudgetsSchema.safeParse({
        budgets: [{ id, monthlyBudget: 0 }],
      }).success,
    ).toBe(false);
    expect(
      updateCategoryBudgetsSchema.safeParse({
        budgets: [{ id: "not-a-uuid", monthlyBudget: 100 }],
      }).success,
    ).toBe(false);
  });
});
