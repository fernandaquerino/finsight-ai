import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CategoryDot } from "./CategoryDot";

describe("CategoryDot", () => {
  it("renders a decorative category color marker", () => {
    const { container } = render(<CategoryDot category="moradia" />);

    const dot = container.querySelector("span");
    expect(dot).toHaveAttribute("aria-hidden", "true");
    expect(dot).toHaveClass("rounded-full");
  });
});
