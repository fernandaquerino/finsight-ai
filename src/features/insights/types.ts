// Contratos da API de insights. Reexporta os tipos do service (import type: não
// entra no bundle do cliente) para que front e back não divirjam.
export type {
  Insight,
  InsightAction,
  InsightCounts,
  InsightEvidence,
  InsightImpactDirection,
  InsightImpactPeriod,
  InsightKind,
  InsightSeverity,
  InsightTotals,
  InsightsSummary,
} from "@/server/services/insights/types";
