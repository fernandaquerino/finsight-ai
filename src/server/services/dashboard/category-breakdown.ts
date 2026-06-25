import { getCategoryMeta } from "@/lib/categories";
import { transactionRepository, type Database } from "@/server/repositories";

import { dashboardCacheKey, getCached, setCached } from "./cache";
import type { ResolvedPeriod } from "./period";

// Fatia do donut de categorias. Mesmo shape consumido pelo DonutChart.
export type CategorySlice = {
  name: string;
  value: number;
  percentage: number;
  color: string;
};

type CategoryAmountRow = {
  categoryName: string | null;
  amount: string;
};

const TOP_N = 5;

function toCents(amount: string): number {
  return Math.round(Number(amount) * 100);
}

// Agrega despesas por categoria (resolvida pela paleta do app), top N + "Outros".
// Pura e testável; soma em centavos. Cores vêm de getCategoryMeta para ficarem
// consistentes com legenda e badges no resto do app.
export function aggregateExpenseCategories(
  rows: readonly CategoryAmountRow[],
): CategorySlice[] {
  type Bucket = { key: string; label: string; color: string; cents: number };
  const byKey = new Map<string, Bucket>();

  for (const row of rows) {
    const meta = getCategoryMeta(row.categoryName ?? "outros");
    const bucket = byKey.get(meta.key);
    if (bucket) {
      bucket.cents += toCents(row.amount);
    } else {
      byKey.set(meta.key, {
        key: meta.key,
        label: meta.label,
        color: meta.color,
        cents: toCents(row.amount),
      });
    }
  }

  const entries = [...byKey.values()].sort((a, b) => b.cents - a.cents);
  const totalCents = entries.reduce((sum, entry) => sum + entry.cents, 0);
  if (totalCents === 0) {
    return [];
  }

  let visible = entries.slice(0, TOP_N);
  const rest = entries.slice(TOP_N);

  if (rest.length > 0) {
    const restCents = rest.reduce((sum, entry) => sum + entry.cents, 0);
    const outros = visible.find((entry) => entry.key === "outros");
    if (outros) {
      outros.cents += restCents;
    } else {
      const meta = getCategoryMeta("outros");
      visible.push({
        key: "outros",
        label: meta.label,
        color: meta.color,
        cents: restCents,
      });
    }
    visible = [...visible].sort((a, b) => b.cents - a.cents);
  }

  return visible.map((entry) => ({
    name: entry.label,
    value: entry.cents / 100,
    percentage: Math.round((entry.cents / totalCents) * 100),
    color: entry.color,
  }));
}

// Composição de gastos do período, isolada por userId e cacheada.
export async function getCategoryBreakdown(
  db: Database,
  userId: string,
  period: ResolvedPeriod,
): Promise<CategorySlice[]> {
  const key = dashboardCacheKey(userId, `categories:${period.key}`);

  const cached = await getCached<CategorySlice[]>(key);
  if (cached) {
    return cached;
  }

  const rows = await transactionRepository.listExpenseCategoryAmounts(
    db,
    userId,
    period.from,
    period.toExclusive,
  );
  const slices = aggregateExpenseCategories(rows);

  await setCached(key, slices);
  return slices;
}
