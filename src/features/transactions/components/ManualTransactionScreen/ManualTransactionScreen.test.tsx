import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ManualTransactionScreen, parseMoney } from "./ManualTransactionScreen";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
}));

const accounts = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Nubank",
    type: "checking",
  },
];
const categories = [
  {
    id: "22222222-2222-4222-8222-222222222222",
    name: "Alimentação",
    color: "#ff8800",
    kind: "expense",
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    name: "Alimentação",
    color: "#ff8800",
    kind: "expense",
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    name: "Salário",
    color: "#16A34A",
    kind: "income",
  },
];

function mockFetch() {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = typeof input === "string" ? input : input.toString();
    const data = url.includes("/api/accounts") ? accounts : categories;
    return {
      ok: true,
      json: async () => ({ data }),
    } as Response;
  });
}

function renderScreen() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ManualTransactionScreen />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ManualTransactionScreen", () => {
  it("renders the manual transaction form and preview", async () => {
    renderScreen();

    expect(
      screen.getByRole("heading", { name: "Nova transação" }),
    ).toBeVisible();
    expect(screen.getByText("Pré-visualização")).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Salvar transação" }),
    ).toBeDisabled();
  });

  it("enables submit once required fields are valid and accounts loaded", async () => {
    const user = userEvent.setup();
    renderScreen();

    // Aguarda as contas carregarem (accountId é preenchido automaticamente).
    await waitFor(() => {
      expect(
        screen.getByRole("option", { name: "Nubank" }),
      ).toBeInTheDocument();
    });

    await user.type(
      screen.getByPlaceholderText("Ex.: Almoço com a equipe"),
      "Padaria São Jorge",
    );
    await user.type(screen.getByPlaceholderText("0,00"), "28,50");

    expect(screen.getByText("Padaria São Jorge")).toBeVisible();
    expect(screen.getByText("-R$ 28,50")).toBeVisible();

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Salvar transação" }),
      ).toBeEnabled();
    });
  });

  it("deduplicates categories and shows income categories when kind changes", async () => {
    const user = userEvent.setup();
    renderScreen();

    await waitFor(() => {
      expect(
        screen.getAllByRole("option", { name: "Alimentação" }),
      ).toHaveLength(1);
    });

    await user.click(screen.getByRole("button", { name: "Receita" }));

    expect(screen.getByRole("option", { name: "Salário" })).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: "Alimentação" }),
    ).not.toBeInTheDocument();
  });

  it("parses Brazilian money input", () => {
    expect(parseMoney("1.234,56")).toBe(1234.56);
  });
});
