import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TransactionAmount } from "./TransactionAmount";

describe("TransactionAmount", () => {
  it("renders expenses with negative sign", () => {
    render(<TransactionAmount value={28.5} type="expense" />);

    expect(screen.getByText("-R$ 28,50")).toBeInTheDocument();
    expect(screen.getByLabelText("Despesa de -R$ 28,50")).toBeInTheDocument();
  });

  it("renders income with positive sign and success color", () => {
    render(<TransactionAmount value={8400} type="income" />);

    expect(screen.getByText("+R$ 8.400,00")).toHaveClass("text-success");
    expect(
      screen.getByLabelText("Receita de +R$ 8.400,00"),
    ).toBeInTheDocument();
  });

  it("infers the amount type from the sign", () => {
    render(<TransactionAmount value={-19.9} />);

    expect(screen.getByText("-R$ 19,90")).toBeInTheDocument();
  });
});
