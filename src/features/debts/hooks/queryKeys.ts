import type { DebtStrategy } from "@/features/debts/types";

// A estratégia e o aporte extra fazem parte da chave: o servidor devolve a
// ordenação e a simulação já resolvidas para aquela combinação.
export const debtQueryKeys = {
  all: ["debts"] as const,
  summary: (strategy: DebtStrategy, extraMonthly: number) =>
    ["debts", "summary", strategy, extraMonthly] as const,
};
