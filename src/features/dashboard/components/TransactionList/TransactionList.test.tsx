import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MOCK_TRANSACTIONS } from "@/features/dashboard/types/dashboard.types";
import { TransactionList } from "./TransactionList";

describe("TransactionList", () => {
  it("renders the title and 'Ver todas' button", () => {
    render(<TransactionList />);

    expect(screen.getByText("Transações recentes")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Ver todas/i }),
    ).toBeInTheDocument();
  });

  it("renders all mock transactions by default", () => {
    render(<TransactionList />);

    for (const t of MOCK_TRANSACTIONS) {
      expect(screen.getByText(t.name)).toBeInTheDocument();
    }
  });

  it("renders skeletons and hides items when isLoading", () => {
    render(<TransactionList isLoading />);

    expect(screen.queryByRole("list", { name: "Transações recentes" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Carregando transações")).toBeInTheDocument();
  });

  it("renders empty state when transactions array is empty", () => {
    render(<TransactionList transactions={[]} />);

    expect(
      screen.getByText("Nenhuma transação no período"),
    ).toBeInTheDocument();
  });
});
