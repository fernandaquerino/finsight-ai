import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MOCK_CATEGORY_DATA } from "@/features/dashboard/types/dashboard.types";
import { CategoryLegend } from "./CategoryLegend";

describe("CategoryLegend", () => {
  it("renders all category names", () => {
    render(<CategoryLegend data={MOCK_CATEGORY_DATA} />);

    for (const item of MOCK_CATEGORY_DATA) {
      expect(screen.getByText(item.name)).toBeInTheDocument();
    }
  });

  it("renders formatted values and percentages", () => {
    render(<CategoryLegend data={MOCK_CATEGORY_DATA} />);

    expect(screen.getByText("R$ 3.120,00")).toBeInTheDocument();
    expect(screen.getByText("43%")).toBeInTheDocument();
  });

  it("renders with accessible list role", () => {
    render(<CategoryLegend data={MOCK_CATEGORY_DATA} />);

    expect(
      screen.getByRole("list", { name: "Categorias de despesas" }),
    ).toBeInTheDocument();
  });

  it("renders an empty list without crashing", () => {
    render(<CategoryLegend data={[]} />);

    expect(
      screen.getByRole("list", { name: "Categorias de despesas" }),
    ).toBeInTheDocument();
  });
});
