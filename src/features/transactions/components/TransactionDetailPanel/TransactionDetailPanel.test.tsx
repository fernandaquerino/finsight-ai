import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { TransactionListItem } from "@/features/transactions/types";

import { TransactionDetailPanel } from "./TransactionDetailPanel";

const transaction: TransactionListItem = {
  id: "33333333-3333-4333-8333-333333333333",
  description: "Padaria São Jorge",
  amount: "28.50",
  currency: "BRL",
  kind: "expense",
  occurredAt: new Date("2026-05-31T12:00:00.000Z").toISOString(),
  origin: "manual",
  category: {
    id: "22222222-2222-4222-8222-222222222222",
    name: "Alimentação",
    color: "#ff8800",
  },
  account: { id: "11111111-1111-4111-8111-111111111111", name: "Nubank" },
};

const categories = [
  {
    id: "22222222-2222-4222-8222-222222222222",
    name: "Alimentação",
    color: "#ff8800",
    kind: "expense",
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    name: "Transporte",
    color: "#8b5cf6",
    kind: "expense",
  },
];

let fetchMock: ReturnType<typeof vi.fn>;

function mockFetch() {
  return vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();
    if (url.includes("/api/categories")) {
      return new Response(JSON.stringify({ data: categories }), {
        status: 200,
      });
    }
    // PATCH / DELETE em /api/transactions/:id
    return new Response(
      JSON.stringify({ data: { id: transaction.id } }),
      { status: 200, headers: { method: String(init?.method) } },
    );
  });
}

function renderPanel(props?: Partial<React.ComponentProps<typeof TransactionDetailPanel>>) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const onClose = vi.fn();
  const onChanged = vi.fn();

  render(
    <QueryClientProvider client={queryClient}>
      <TransactionDetailPanel
        transaction={transaction}
        open
        onClose={onClose}
        onChanged={onChanged}
        {...props}
      />
    </QueryClientProvider>,
  );

  return { onClose, onChanged };
}

beforeEach(() => {
  fetchMock = mockFetch();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("TransactionDetailPanel", () => {
  it("shows the transaction details", () => {
    renderPanel();

    expect(
      screen.getByRole("heading", { name: "Detalhe da transação" }),
    ).toBeVisible();
    // Descrição aparece como título e na linha "Descrição".
    expect(screen.getAllByText("Padaria São Jorge").length).toBeGreaterThan(0);
    expect(screen.getByText("-R$ 28,50")).toBeVisible();
    expect(screen.getByText("Manual")).toBeVisible();
  });

  it("recategorizes via the inline select", async () => {
    const user = userEvent.setup();
    const { onChanged } = renderPanel();

    await waitFor(() => {
      expect(
        screen.getByRole("option", { name: "Transporte" }),
      ).toBeInTheDocument();
    });

    await user.selectOptions(
      screen.getByLabelText("Recategorizar transação"),
      "44444444-4444-4444-8444-444444444444",
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        `/api/transactions/${transaction.id}`,
        expect.objectContaining({ method: "PATCH" }),
      );
    });
    await waitFor(() => expect(onChanged).toHaveBeenCalled());
  });

  it("deletes after confirmation", async () => {
    const user = userEvent.setup();
    const { onChanged, onClose } = renderPanel();

    await user.click(screen.getByRole("button", { name: /Excluir/ }));
    // Botão de confirmação dentro do bloco destrutivo.
    await user.click(screen.getByRole("button", { name: "Excluir" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        `/api/transactions/${transaction.id}`,
        expect.objectContaining({ method: "DELETE" }),
      );
    });
    await waitFor(() => {
      expect(onChanged).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });
});
