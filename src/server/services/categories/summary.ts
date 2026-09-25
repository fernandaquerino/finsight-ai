import { resolveCategoryIconKey, type CategoryKey } from "@/lib/categories";
import {
  categoryRepository,
  transactionRepository,
  type Database,
} from "@/server/repositories";

// Uso do orçamento: "warning" a partir de 80%, "over" acima de 100%.
export const BUDGET_WARNING_RATIO = 0.8;

export type BudgetStatus = "none" | "ok" | "warning" | "over";

export type CategorySummaryItem = {
  id: string;
  name: string;
  color: string;
  kind: "income" | "expense";
  icon: CategoryKey;
  monthlyBudget: number | null;
  // Total movimentado no mês (gasto em despesas, recebido em receitas).
  amount: number;
  monthTransactionCount: number;
  // Todas as datas — informa quantas transações serão movidas ao excluir.
  totalTransactionCount: number;
  // amount / monthlyBudget (pode passar de 1). null sem orçamento.
  budgetUsage: number | null;
  budgetStatus: BudgetStatus;
};

export type CategoriesSummary = {
  month: string; // YYYY-MM
  items: CategorySummaryItem[];
  totals: {
    expense: number;
    income: number;
    budget: number;
    budgetedExpense: number;
  };
};

type CategoryRow = {
  id: string;
  name: string;
  color: string;
  kind: "income" | "expense";
  icon: string | null;
  monthlyBudget: string | null;
};

type PeriodTotalRow = {
  categoryId: string | null;
  kind: "income" | "expense" | "transfer";
  total: string | null;
  count: number;
};

type CountRow = { categoryId: string | null; count: number };

export function getBudgetStatus(usage: number | null): BudgetStatus {
  if (usage === null) return "none";
  if (usage > 1) return "over";
  if (usage >= BUDGET_WARNING_RATIO) return "warning";
  return "ok";
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

// Função pura: junta categorias, totais do período e contagens. Só soma o
// `kind` que casa com o da categoria (transferências não entram em orçamento).
export function buildCategoriesSummary(
  month: string,
  categories: readonly CategoryRow[],
  periodTotals: readonly PeriodTotalRow[],
  allTimeCounts: readonly CountRow[],
): CategoriesSummary {
  const totalsByKey = new Map<string, { amount: number; count: number }>();
  for (const row of periodTotals) {
    if (!row.categoryId) continue;
    totalsByKey.set(`${row.categoryId}:${row.kind}`, {
      amount: Number(row.total ?? 0),
      count: row.count,
    });
  }

  const countsById = new Map<string, number>();
  for (const row of allTimeCounts) {
    if (row.categoryId) countsById.set(row.categoryId, row.count);
  }

  const items = categories.map((category): CategorySummaryItem => {
    const period = totalsByKey.get(`${category.id}:${category.kind}`);
    const amount = roundMoney(period?.amount ?? 0);
    const budget =
      category.monthlyBudget === null ? null : Number(category.monthlyBudget);
    const budgetUsage = budget && budget > 0 ? amount / budget : null;

    return {
      id: category.id,
      name: category.name,
      color: category.color,
      kind: category.kind,
      icon: resolveCategoryIconKey(category),
      monthlyBudget: budget,
      amount,
      monthTransactionCount: period?.count ?? 0,
      totalTransactionCount: countsById.get(category.id) ?? 0,
      budgetUsage,
      budgetStatus: getBudgetStatus(budgetUsage),
    };
  });

  // Mais movimentadas primeiro; empate por nome.
  items.sort(
    (a, b) => b.amount - a.amount || a.name.localeCompare(b.name, "pt-BR"),
  );

  const expenseItems = items.filter((item) => item.kind === "expense");
  const budgeted = expenseItems.filter((item) => item.monthlyBudget !== null);

  return {
    month,
    items,
    totals: {
      expense: roundMoney(expenseItems.reduce((t, i) => t + i.amount, 0)),
      income: roundMoney(
        items
          .filter((item) => item.kind === "income")
          .reduce((t, i) => t + i.amount, 0),
      ),
      budget: roundMoney(
        budgeted.reduce((t, i) => t + (i.monthlyBudget ?? 0), 0),
      ),
      budgetedExpense: roundMoney(budgeted.reduce((t, i) => t + i.amount, 0)),
    },
  };
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

// "YYYY-MM" → [início do mês, início do mês seguinte). Sem mês → mês corrente.
export function resolveMonth(
  month: string | undefined,
  now: Date = new Date(),
): { key: string; from: Date; toExclusive: Date } {
  const [year, monthIndex] = month
    ? month.split("-").map(Number)
    : [now.getFullYear(), now.getMonth() + 1];
  const y = year ?? now.getFullYear();
  const m = monthIndex ?? now.getMonth() + 1;

  return {
    key: `${y}-${pad(m)}`,
    from: new Date(y, m - 1, 1),
    toExclusive: new Date(y, m, 1),
  };
}

export async function getCategoriesSummary(
  db: Database,
  userId: string,
  month: string | undefined,
): Promise<CategoriesSummary> {
  const period = resolveMonth(month);

  const [categories, periodTotals, allTimeCounts] = await Promise.all([
    categoryRepository.listByUser(db, userId),
    transactionRepository.sumByCategoryInPeriod(
      db,
      userId,
      period.from,
      period.toExclusive,
    ),
    transactionRepository.countByCategory(db, userId),
  ]);

  return buildCategoriesSummary(
    period.key,
    categories,
    periodTotals,
    allTimeCounts,
  );
}
