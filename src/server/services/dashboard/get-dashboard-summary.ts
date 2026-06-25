import { transactionRepository, type Database } from "@/server/repositories";

import { calculateMetrics, type DashboardMetrics } from "./calculate-metrics";
import { dashboardCacheKey, getCached, setCached } from "./cache";
import type { ResolvedPeriod } from "./period";

export type DashboardSummary = {
  period: { from: string; to: string };
  metrics: DashboardMetrics;
  // Quantidade de transações no período — permite distinguir "sem dados" de
  // "tudo zerado" na UI (empty state por período).
  transactionCount: number;
};

// Orquestra a leitura: tenta o cache, senão lê do banco (isolado por userId),
// calcula as métricas e popula o cache. Cache-miss/erro de Redis é transparente.
export async function getDashboardSummary(
  db: Database,
  userId: string,
  period: ResolvedPeriod,
): Promise<DashboardSummary> {
  const key = dashboardCacheKey(userId, period.key);

  const cached = await getCached<DashboardSummary>(key);
  if (cached) {
    return cached;
  }

  const transactions = await transactionRepository.listByUserInPeriod(
    db,
    userId,
    period.from,
    period.toExclusive,
  );
  const metrics = calculateMetrics(transactions);

  const [from = "", to = ""] = period.key.split("_");
  const summary: DashboardSummary = {
    period: { from, to },
    metrics,
    transactionCount: transactions.length,
  };

  await setCached(key, summary);
  return summary;
}
