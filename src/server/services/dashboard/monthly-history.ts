import { transactionRepository, type Database } from "@/server/repositories";

import { dashboardCacheKey, getCached, setCached } from "./cache";

// Ponto da série histórica (receita vs despesa por mês). Mesmo shape consumido
// pelo BarChart no front.
export type MonthlySeriesPoint = {
  month: string;
  receitas: number;
  despesas: number;
};

type MonthBucket = {
  year: number;
  monthIndex: number; // 0-11
  label: string;
};

const MONTH_LABELS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
] as const;

// Os `count` meses terminando no mês de `now` (inclusivo), do mais antigo ao
// mais recente.
export function lastMonths(now: Date, count: number): MonthBucket[] {
  const buckets: MonthBucket[] = [];

  for (let offset = count - 1; offset >= 0; offset--) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    buckets.push({
      year: date.getFullYear(),
      monthIndex: date.getMonth(),
      label: MONTH_LABELS[date.getMonth()] ?? "",
    });
  }

  return buckets;
}

type AggregateInput = {
  occurredAt: Date;
  kind: "income" | "expense" | "transfer";
  amount: string;
};

function toCents(amount: string): number {
  return Math.round(Number(amount) * 100);
}

// Agrega transações nos buckets mensais. Pura e testável: a soma é feita em
// centavos para evitar erro de ponto flutuante.
export function aggregateMonthly(
  transactions: readonly AggregateInput[],
  buckets: readonly MonthBucket[],
): MonthlySeriesPoint[] {
  const indexByKey = new Map<string, number>();
  buckets.forEach((bucket, index) => {
    indexByKey.set(`${bucket.year}-${bucket.monthIndex}`, index);
  });

  const cents = buckets.map(() => ({ receitas: 0, despesas: 0 }));

  for (const transaction of transactions) {
    const date = new Date(transaction.occurredAt);
    const bucketIndex = indexByKey.get(
      `${date.getFullYear()}-${date.getMonth()}`,
    );
    if (bucketIndex === undefined) {
      continue;
    }

    const slot = cents[bucketIndex];
    if (!slot) {
      continue;
    }

    if (transaction.kind === "income") {
      slot.receitas += toCents(transaction.amount);
    } else if (transaction.kind === "expense") {
      slot.despesas += toCents(transaction.amount);
    }
  }

  return buckets.map((bucket, index) => ({
    month: bucket.label,
    receitas: (cents[index]?.receitas ?? 0) / 100,
    despesas: (cents[index]?.despesas ?? 0) / 100,
  }));
}

// Série dos últimos `count` meses, isolada por usuário e cacheada.
export async function getMonthlyHistory(
  db: Database,
  userId: string,
  now: Date = new Date(),
  count = 6,
): Promise<MonthlySeriesPoint[]> {
  const key = dashboardCacheKey(userId, `history:${count}m`);

  const cached = await getCached<MonthlySeriesPoint[]>(key);
  if (cached) {
    return cached;
  }

  const buckets = lastMonths(now, count);
  const from = new Date(now.getFullYear(), now.getMonth() - (count - 1), 1);
  const toExclusive = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const transactions = await transactionRepository.listByUserInPeriod(
    db,
    userId,
    from,
    toExclusive,
  );
  const series = aggregateMonthly(transactions, buckets);

  await setCached(key, series);
  return series;
}
