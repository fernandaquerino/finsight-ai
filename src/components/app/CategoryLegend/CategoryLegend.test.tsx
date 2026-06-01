import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CategoryLegend } from "./CategoryLegend";

const categoryData = [
  { category: "moradia", value: 3120, percentage: 43 },
  { category: "alimentacao", value: 1842, percentage: 25 },
] as const;

describe("CategoryLegend", () => {
  it("renders category labels, money values, and percentages", () => {
    render(<CategoryLegend data={categoryData} />);

    expect(
      screen.getByRole("list", { name: "Categorias de despesas" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Moradia")).toBeInTheDocument();
    expect(screen.getByText("R$ 3.120,00")).toBeInTheDocument();
    expect(screen.getByText("43%")).toBeInTheDocument();
  });

  it("notifies hover index changes", async () => {
    const user = userEvent.setup();
    const onHoverIndex = vi.fn();

    render(<CategoryLegend data={categoryData} onHoverIndex={onHoverIndex} />);

    await user.hover(screen.getByText("Moradia"));
    await user.unhover(screen.getByText("Moradia"));

    expect(onHoverIndex).toHaveBeenCalledWith(0);
    expect(onHoverIndex).toHaveBeenCalledWith(undefined);
  });
});
