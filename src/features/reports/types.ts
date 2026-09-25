// Contratos da API de relatórios. Reexporta os tipos do service (import type:
// não entra no bundle do cliente) para que front e back não divirjam.
export type {
  ReportBudgetItem,
  ReportCategorySlice,
  ReportMetric,
  ReportSeriesPoint,
  ReportSummary,
} from "@/server/services/reports/build-report";

export type { ReportGranularity } from "@/server/services/reports/period";
