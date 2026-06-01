import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TransactionListItem, formatAmount } from "./TransactionListItem";
import type { Transaction } from "@/features/dashboard/types/dashboard.types";

const BASE: Transaction = {
  id: "1",
  name: "Padaria São Jorge",
  source: "Extrato",
  date: "31 mai",
  amount: -28.5,
  category: "alimentacao",
};

describe("formatAmount", () => {
  it("prefixes negative amounts with -", () => {
    expect(formatAmount(-28.5)).toMatch(/^-R\$/);
  });

  it("prefixes positive amounts with +", () => {
    expect(formatAmount(8400)).toMatch(/^\+R\$/);
  });
});

describe("TransactionListItem", () => {
  it("renders the transaction name, date and source", () => {
    render(<ul><TransactionListItem transaction={BASE} /></ul>);

    expect(screen.getByText("Padaria São Jorge")).toBeInTheDocument();
    expect(screen.getByText("31 mai · Extrato")).toBeInTheDocument();
  });

  it("renders a negative amount with accessible debit label", () => {
    render(<ul><TransactionListItem transaction={BASE} /></ul>);

    const amount = screen.getByLabelText(/Débito/);
    expect(amount).toBeInTheDocument();
    expect(amount.textContent).toMatch(/^-R\$/);
  });

  it("renders a positive amount with accessible credit label", () => {
    const credit: Transaction = { ...BASE, id: "2", amount: 8400, category: "salario" };
    render(<ul><TransactionListItem transaction={credit} /></ul>);

    const amount = screen.getByLabelText(/Crédito/);
    expect(amount).toBeInTheDocument();
    expect(amount.textContent).toMatch(/^\+R\$/);
  });

  it("falls back gracefully for unknown category", () => {
    const unknown = { ...BASE, category: "outro" } as Transaction;
    render(<ul><TransactionListItem transaction={unknown} /></ul>);

    expect(screen.getByText("Padaria São Jorge")).toBeInTheDocument();
  });
});
