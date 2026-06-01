import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SourceReference } from "./SourceReference";

describe("SourceReference", () => {
  it("renders source text", () => {
    render(<SourceReference>Baseado em 28 transações de maio</SourceReference>);
    expect(
      screen.getByText("Baseado em 28 transações de maio"),
    ).toBeInTheDocument();
  });

  it("has a decorative icon that is hidden from screen readers", () => {
    const { container } = render(<SourceReference>Fonte</SourceReference>);
    const icon = container.querySelector("[aria-hidden='true']");
    expect(icon).toBeInTheDocument();
  });
});
