import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Database } from "@/server/repositories";

const getDashboardSummary = vi.fn();
const getCategoriesSummary = vi.fn();
const listTransactions = vi.fn();
const getGoalsSummary = vi.fn();
const getDebtsSummary = vi.fn();
const getInsightsSummary = vi.fn();

vi.mock("@/server/services/dashboard/get-dashboard-summary", () => ({
  getDashboardSummary: (...args: unknown[]) => getDashboardSummary(...args),
}));
vi.mock("@/server/services/categories/summary", () => ({
  getCategoriesSummary: (...args: unknown[]) => getCategoriesSummary(...args),
}));
vi.mock("@/server/services/transactions/list", () => ({
  listTransactions: (...args: unknown[]) => listTransactions(...args),
}));
vi.mock("@/server/services/goals/summary", () => ({
  getGoalsSummary: (...args: unknown[]) => getGoalsSummary(...args),
}));
vi.mock("@/server/services/debts/summary", () => ({
  getDebtsSummary: (...args: unknown[]) => getDebtsSummary(...args),
}));
vi.mock("@/server/services/insights/summary", () => ({
  getInsightsSummary: (...args: unknown[]) => getInsightsSummary(...args),
}));

const { buildFinancialTools } = await import("./financial-tools");

const OWNER = "user-owner";
const db = {} as Database;
const now = new Date(2026, 4, 15); // 2026-05-15

// A tool é chamada como o AI SDK chama: input já validado + options.
async function run(toolName: string, input: unknown) {
  const tools = buildFinancialTools({ db, userId: OWNER, now });
  const tool = tools[toolName];

  if (!tool?.execute) {
    throw new Error(`tool ${toolName} não tem execute`);
  }

  return tool.execute(input, {
    toolCallId: "call-1",
    messages: [],
    context: {},
  });
}

beforeEach(() => {
  vi.clearAllMocks();

  getDashboardSummary.mockResolvedValue({
    period: { from: "2026-05-01", to: "2026-05-31" },
    metrics: { income: 9000, expenses: 6500, balance: 2500, savings: 0.27 },
    transactionCount: 84,
  });
  getCategoriesSummary.mockResolvedValue({
    month: "2026-05",
    items: [
      {
        id: "c1",
        name: "Moradia",
        color: "#000",
        kind: "expense",
        icon: "home",
        monthlyBudget: 3500,
        amount: 3120,
        monthTransactionCount: 4,
        totalTransactionCount: 40,
        budgetUsage: 0.8914285,
        budgetStatus: "warning",
      },
      {
        id: "c2",
        name: "Salário",
        color: "#0f0",
        kind: "income",
        icon: "wallet",
        monthlyBudget: null,
        amount: 9000,
        monthTransactionCount: 1,
        totalTransactionCount: 12,
        budgetUsage: null,
        budgetStatus: "none",
      },
      {
        id: "c3",
        name: "Sem movimento",
        color: "#00f",
        kind: "expense",
        icon: "tag",
        monthlyBudget: 200,
        amount: 0,
        monthTransactionCount: 0,
        totalTransactionCount: 3,
        budgetUsage: 0,
        budgetStatus: "ok",
      },
    ],
    totals: {
      expense: 6500,
      income: 9000,
      budget: 3700,
      budgetedExpense: 3120,
    },
  });
  listTransactions.mockResolvedValue({
    items: [
      {
        id: "t1",
        description: "Spotify",
        amount: "21.90",
        currency: "BRL",
        kind: "expense",
        occurredAt: new Date(Date.UTC(2026, 4, 3)),
        origin: "import",
        isRecurring: true,
        category: { id: "c4", name: "Assinaturas", color: "#f00" },
        account: { id: "a1", name: "Nubank" },
      },
    ],
    total: 3,
    page: 1,
    hasNext: false,
  });
  getGoalsSummary.mockResolvedValue({
    items: [],
    totals: {
      saved: 0,
      target: 0,
      monthlyContribution: 0,
      goalCount: 0,
      onTrackCount: 0,
      averageProgress: null,
    },
  });
  getDebtsSummary.mockResolvedValue({
    strategy: "avalanche",
    extraMonthly: 0,
    items: [],
    totals: {
      remaining: 0,
      monthlyPayment: 0,
      monthlyInterest: 0,
      debtCount: 0,
    },
    focusDebtName: null,
    simulation: {},
    comparison: {},
    recommendation: null,
  });
  getInsightsSummary.mockResolvedValue({
    month: "2026-05",
    items: [],
    counts: { risk: 0, opportunity: 0, attention: 0, info: 0, all: 0 },
    totals: {
      potentialMonthlySavings: 0,
      potentialAnnualSavings: 0,
      amountUnderReview: 0,
    },
  });
});

describe("isolamento por usuário", () => {
  const services = [
    ["getMonthlySummary", () => getDashboardSummary],
    ["getSpendingByCategory", () => getCategoriesSummary],
    ["searchTransactions", () => listTransactions],
    ["getGoalsProgress", () => getGoalsSummary],
    ["getDebtsOverview", () => getDebtsSummary],
    ["getInsights", () => getInsightsSummary],
  ] as const;

  it.each(services)(
    "%s repassa o userId do contexto para o service",
    async (toolName, getSpy) => {
      await run(toolName, {});

      expect(getSpy()).toHaveBeenCalledOnce();
      expect(getSpy().mock.calls[0]?.[1]).toBe(OWNER);
    },
  );

  it("nenhuma tool aceita userId como parâmetro de entrada", () => {
    const tools = buildFinancialTools({ db, userId: OWNER, now });

    for (const [name, tool] of Object.entries(tools)) {
      const shape = (
        tool.inputSchema as unknown as { shape?: Record<string, unknown> }
      ).shape;

      expect(shape, `tool ${name} sem shape`).toBeDefined();
      expect(Object.keys(shape ?? {})).not.toContain("userId");
    }
  });

  it("ignora um userId injetado no input da tool", async () => {
    await run("getMonthlySummary", { month: "2026-05", userId: "outro-user" });

    expect(getDashboardSummary.mock.calls[0]?.[1]).toBe(OWNER);
  });
});

describe("getMonthlySummary", () => {
  it("resolve o mês pedido e cita a fonte", async () => {
    const result = await run("getMonthlySummary", { month: "2026-05" });

    const period = getDashboardSummary.mock.calls[0]?.[2] as {
      from: Date;
      toExclusive: Date;
      key: string;
    };
    expect(period.key).toBe("2026-05-01_2026-05-31");
    expect(period.from).toEqual(new Date(2026, 4, 1));
    expect(period.toExclusive).toEqual(new Date(2026, 5, 1));

    expect(result).toMatchObject({
      income: 9000,
      expenses: 6500,
      balance: 2500,
      transactionCount: 84,
    });
    expect(result.source).toContain("84 transações");
  });

  it("sem mês, usa o mês de `now`", async () => {
    await run("getMonthlySummary", {});

    const period = getDashboardSummary.mock.calls[0]?.[2] as { key: string };
    expect(period.key).toBe("2026-05-01_2026-05-31");
  });
});

describe("getSpendingByCategory", () => {
  it("devolve só despesas com movimento, ordenadas e com participação", async () => {
    const result = await run("getSpendingByCategory", { month: "2026-05" });

    expect(result.categories).toHaveLength(1);
    expect(result.categories[0]).toMatchObject({
      name: "Moradia",
      amount: 3120,
      budgetUsage: 0.89,
      budgetStatus: "warning",
      shareOfExpenses: 0.48,
    });
    expect(result.source).toContain("categoria");
  });

  it("respeita o limite pedido", async () => {
    const result = await run("getSpendingByCategory", { limit: 1 });

    expect(result.categories).toHaveLength(1);
  });
});

describe("searchTransactions", () => {
  it("repassa os filtros e formata a data em ISO", async () => {
    const result = await run("searchTransactions", {
      search: "Spotify",
      kind: "expense",
      limit: 5,
    });

    expect(listTransactions.mock.calls[0]?.[2]).toMatchObject({
      search: "Spotify",
      kind: "expense",
      page: 1,
      limit: 5,
    });
    expect(result.transactions[0]).toMatchObject({
      date: "2026-05-03",
      description: "Spotify",
      amount: 21.9,
      category: "Assinaturas",
    });
    expect(result.source).toBe("1 de 3 transações que atendem ao filtro");
  });
});

describe("getDebtsOverview", () => {
  it("usa avalanche como padrão", async () => {
    await run("getDebtsOverview", {});

    expect(getDebtsSummary).toHaveBeenCalledWith(db, OWNER, "avalanche", 0);
  });

  it("repassa a estratégia e o aporte extra pedidos", async () => {
    await run("getDebtsOverview", {
      strategy: "snowball",
      extraMonthly: 300,
    });

    expect(getDebtsSummary).toHaveBeenCalledWith(db, OWNER, "snowball", 300);
  });
});
