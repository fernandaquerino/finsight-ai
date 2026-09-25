// Contratos da API de dívidas. Reexporta os tipos do service (import type: não
// entra no bundle do cliente) para que front e back não divirjam.
export type {
  DebtKind,
  DebtRecommendation,
  DebtStatus,
  DebtStrategy,
  DebtSummaryItem,
  DebtsSummary,
} from "@/server/services/debts/summary";

export type {
  PayoffSimulation,
  StrategyComparison,
} from "@/server/services/debts/strategy";

import type { DebtKind } from "@/server/services/debts/summary";

export const debtKindLabels = {
  credit_card: "Cartão de crédito",
  personal_loan: "Empréstimo pessoal",
  financing: "Financiamento",
  consumer_credit: "Crédito pessoal",
  other: "Outro",
} as const satisfies Record<DebtKind, string>;

export const debtKindOptions = (Object.keys(debtKindLabels) as DebtKind[]).map(
  (value) => ({ value, label: debtKindLabels[value] }),
);
