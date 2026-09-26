import {
  categoryRepository,
  transactionRepository,
  type Database,
} from "@/server/repositories";
import {
  getCategoriesSummary,
  resolveMonth,
} from "@/server/services/categories/summary";
import { getGoalsSummary } from "@/server/services/goals/summary";

import {
  getCachedInsights,
  insightsCacheKey,
  setCachedInsights,
} from "./cache";
import { detectInsights } from "./detectors";
import type {
  Insight,
  InsightCounts,
  InsightSeverity,
  InsightTotals,
  InsightsSummary,
} from "./types";

// Janela de comparação: mês corrente + 5 anteriores. Cobre o mínimo de história
// exigido pelos detectores (3 meses) com margem, sem varrer o histórico inteiro.
export const INSIGHTS_WINDOW_MONTHS = 6;

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function countBySeverity(insights: readonly Insight[]): InsightCounts {
  const counts: Record<InsightSeverity, number> = {
    risk: 0,
    opportunity: 0,
    attention: 0,
    info: 0,
  };

  for (const insight of insights) {
    counts[insight.severity] += 1;
  }

  return { ...counts, all: insights.length };
}

// Só o que de fato se repete entra na economia anualizada. Excesso já gasto
// ("overspend") e valor em dúvida ("review") ficam fora: anualizá-los seria
// prometer economia que o dado não sustenta.
export function sumTotals(insights: readonly Insight[]): InsightTotals {
  const potentialMonthlySavings = roundMoney(
    insights
      .filter(
        (insight) =>
          insight.impactDirection === "savings" &&
          insight.impactPeriod === "monthly",
      )
      .reduce((sum, insight) => sum + insight.impact, 0),
  );

  const amountUnderReview = roundMoney(
    insights
      .filter((insight) => insight.impactDirection === "review")
      .reduce((sum, insight) => sum + insight.impact, 0),
  );

  return {
    potentialMonthlySavings,
    potentialAnnualSavings: roundMoney(potentialMonthlySavings * 12),
    amountUnderReview,
  };
}

// Orquestra a leitura e roda os detectores. Isolado por userId: toda consulta
// passa por repositórios/services que filtram pela sessão.
export async function getInsightsSummary(
  db: Database,
  userId: string,
  month?: string,
): Promise<InsightsSummary> {
  const period = resolveMonth(month);
  const cacheKey = insightsCacheKey(userId, period.key);

  const cached = await getCachedInsights<InsightsSummary>(cacheKey);
  if (cached) {
    return cached;
  }

  const windowStart = new Date(
    period.from.getFullYear(),
    period.from.getMonth() - (INSIGHTS_WINDOW_MONTHS - 1),
    1,
  );

  const [transactions, categories, categoriesSummary, goalsSummary] =
    await Promise.all([
      transactionRepository.listByUserInPeriod(
        db,
        userId,
        windowStart,
        period.toExclusive,
      ),
      categoryRepository.listByUser(db, userId),
      getCategoriesSummary(db, userId, period.key),
      getGoalsSummary(db, userId),
    ]);

  const items = detectInsights({
    monthKey: period.key,
    transactions,
    categories: categories.map((category) => ({
      id: category.id,
      name: category.name,
    })),
    budgetCategories: categoriesSummary.items
      .filter((item) => item.kind === "expense")
      .map((item) => ({
        id: item.id,
        name: item.name,
        monthlyBudget: item.monthlyBudget,
        amount: item.amount,
        budgetStatus: item.budgetStatus,
      })),
    goals: goalsSummary.items,
  });

  const summary: InsightsSummary = {
    month: period.key,
    items,
    counts: countBySeverity(items),
    totals: sumTotals(items),
  };

  await setCachedInsights(cacheKey, summary);
  return summary;
}
