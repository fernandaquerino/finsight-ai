import {
  categoryRepository,
  transactionRepository,
  type Database,
} from "@/server/repositories";

import { buildReport, type ReportSummary } from "./build-report";
import type { ResolvedReportPeriod } from "./period";

// Orquestra a leitura do relatório: período atual, período anterior (para as
// variações) e categorias. Os três repositories filtram por userId.
export async function getReport(
  db: Database,
  userId: string,
  period: ResolvedReportPeriod,
): Promise<ReportSummary> {
  const [transactions, previousTransactions, categories] = await Promise.all([
    transactionRepository.listByUserInPeriod(
      db,
      userId,
      period.from,
      period.toExclusive,
    ),
    transactionRepository.listByUserInPeriod(
      db,
      userId,
      period.previousFrom,
      period.previousToExclusive,
    ),
    categoryRepository.listByUser(db, userId),
  ]);

  return buildReport(period, transactions, previousTransactions, categories);
}
