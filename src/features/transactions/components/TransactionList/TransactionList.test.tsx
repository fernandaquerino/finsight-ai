import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { TransactionListItem } from "@/features/transactions/types";

import { groupTransactionsByDate, TransactionList } from "./TransactionList";

const transactions: TransactionListItem[] = [
  {
    id: "tx-1",
    description: "Padaria Sao Jorge",
    amount: "28.50",
    currency: "BRL",
    kind: "expense",
    occurredAt: "2026-06-24T12:00:00.000Z",
    origin: "import",
    category: {
      id: "cat-1",
      name: "Alimentacao",
      color: "#20a077",
    },
    account: {
      id: "acc-1",
      name: "Nubank",
    },
  },
  {
    id: "tx-2",
    description: "Salario",
    amount: "8400.00",
    currency: "BRL",
    kind: "income",
    occurredAt: "2026-06-23T12:00:00.000Z",
    origin: "manual",
    category: {
      id: "cat-2",
      name: "Receita",
      color: "#16a34a",
    },
    account: {
      id: "acc-1",
      name: "Nubank",
    },
  },
];

describe("TransactionList", () => {
  it("groups transactions by date", () => {
    const groups = groupTransactionsByDate(
      transactions,
      new Date("2026-06-24T18:00:00.000Z"),
    );

    expect(groups).toHaveLength(2);
    expect(groups[0]?.label).toBe("Hoje");
    expect(groups[1]?.label).toBe("Ontem");
  });

  it("renders core transaction information", () => {
    render(
      <TransactionList
        transactions={transactions}
        now={new Date("2026-06-24T18:00:00.000Z")}
      />,
    );

    expect(screen.getByText("Hoje")).toBeInTheDocument();
    expect(screen.getByText("Padaria Sao Jorge")).toBeInTheDocument();
    expect(screen.getByText("Alimentacao")).toBeInTheDocument();
    expect(screen.getByText("Manual")).toBeInTheDocument();
    expect(screen.getAllByText(/-R\$ 28,50/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/\+R\$ 8.400,00/).length).toBeGreaterThan(0);
  });
});
