import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CategoryBadge } from "./CategoryBadge";

describe("CategoryBadge", () => {
  it("renders the stable label for a category", () => {
    render(<CategoryBadge category="alimentacao" />);

    expect(screen.getByText("Alimentação")).toBeInTheDocument();
  });

  it("falls back to Outros for unknown categories", () => {
    render(<CategoryBadge category="pets" />);

    expect(screen.getByText("Outros")).toBeInTheDocument();
  });
});
