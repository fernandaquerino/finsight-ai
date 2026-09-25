import type { ReportGranularity } from "@/features/reports/types";

// Granularidade + mês-âncora identificam o período: o servidor resolve o
// trimestre/ano a partir deles.
export const reportQueryKeys = {
  all: ["reports"] as const,
  summary: (granularity: ReportGranularity, month: string) =>
    ["reports", "summary", granularity, month] as const,
};
