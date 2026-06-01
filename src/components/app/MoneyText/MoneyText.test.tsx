import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MoneyText } from "./MoneyText";

describe("MoneyText", () => {
  it("formats BRL values", () => {
    render(<MoneyText value={14821.5} />);

    expect(screen.getByText("R$ 14.821,50")).toBeInTheDocument();
  });

  it("supports positive, negative, and neutral tones", () => {
    const { rerender } = render(<MoneyText value={120} />);

    expect(screen.getByText("R$ 120,00")).toHaveClass("text-success");

    rerender(<MoneyText value={-120} />);
    expect(screen.getByText("-R$ 120,00")).toHaveClass("text-danger");

    rerender(<MoneyText value={0} />);
    expect(screen.getByText("R$ 0,00")).toHaveClass("text-foreground");
  });

  it("can render explicit signs", () => {
    render(<MoneyText value={120} showSign />);

    expect(screen.getByText("+R$ 120,00")).toBeInTheDocument();
  });
});
