// Contratos da API de metas. Reexporta os tipos do service (import type: não
// entra no bundle do cliente) para que front e back não divirjam.
export type {
  GoalProjection,
  GoalStatus,
  GoalSummaryItem,
  GoalsSummary,
} from "@/server/services/goals/summary";

export type { GoalIconKey } from "@/lib/goals";
