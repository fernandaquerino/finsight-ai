import { resolveCategoryIconKey, type CategoryKey } from "@/lib/categories";

import type { ResolvedReportPeriod } from "./period";

// Montagem do relatório: função pura sobre as linhas já lidas do banco.
// Nenhuma chamada de LLM — o "resumo do período" é texto derivado dos números.

export type ReportTransaction = Readonly<{
  categoryId: string | null;
  kind: "income" | "expense" | "transfer";
  amount: string;
  description: string | null;
  occurredAt: Date;
}>;

export type ReportCategory = Readonly<{
  id: string;
  name: string;
  color: string;
  kind: "income" | "expense";
  icon: string | null;
  monthlyBudget: string | null;
}>;

export type ReportSeriesPoint = Readonly<{
  month: string;
  receitas: number;
  despesas: number;
}>;

export type ReportCategorySlice = Readonly<{
  id: string;
  name: string;
  color: string;
  icon: CategoryKey;
  value: number;
  percentage: number;
  transactionCount: number;
}>;

export type ReportBudgetItem = Readonly<{
  id: string;
  name: string;
  color: string;
  amount: number;
  // Limite mensal × meses do período.
  budget: number;
}>;

export type ReportMetric = Readonly<{
  value: number;
  // Variação percentual vs. período anterior de igual duração. null quando o
  // período anterior não teve movimento (divisão por zero não é "0%").
  deltaPercentage: number | null;
}>;

export type ReportSummary = Readonly<{
  period: Readonly<{
    granularity: ResolvedReportPeriod["granularity"];
    key: string;
    label: string;
    from: string; // YYYY-MM-DD
    to: string; // YYYY-MM-DD (inclusivo)
    monthCount: number;
  }>;
  income: ReportMetric;
  expenses: ReportMetric;
  balance: number;
  savingsRate: number | null;
  transactionCount: number;
  largestExpense: Readonly<{ description: string; amount: number }> | null;
  mostFrequentCategory: Readonly<{ name: string; count: number }> | null;
  series: readonly ReportSeriesPoint[];
  expenseComposition: readonly ReportCategorySlice[];
  budgetUsage: readonly ReportBudgetItem[];
  // Frase-resumo determinística, com a fonte dos números.
  highlight: Readonly<{ title: string; description: string; source: string }>;
}>;

function toCents(amount: string): number {
  return Math.round(Number(amount) * 100);
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatBRL(value: number): string {
  return `R$ ${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function sumCents(
  transactions: readonly ReportTransaction[],
  kind: "income" | "expense",
): number {
  return transactions
    .filter((transaction) => transaction.kind === kind)
    .reduce((total, transaction) => total + toCents(transaction.amount), 0);
}

// Variação percentual. Base zero → null: "infinito por cento" não informa nada.
export function percentageChange(
  current: number,
  previous: number,
): number | null {
  if (previous === 0) return null;

  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function buildSeries(
  transactions: readonly ReportTransaction[],
  period: ResolvedReportPeriod,
): ReportSeriesPoint[] {
  const indexByKey = new Map<string, number>();
  period.months.forEach((bucket, index) => {
    indexByKey.set(`${bucket.year}-${bucket.monthIndex}`, index);
  });

  const cents = period.months.map(() => ({ receitas: 0, despesas: 0 }));

  for (const transaction of transactions) {
    const date = new Date(transaction.occurredAt);
    const index = indexByKey.get(`${date.getFullYear()}-${date.getMonth()}`);
    if (index === undefined) continue;

    const slot = cents[index];
    if (!slot) continue;

    if (transaction.kind === "income") {
      slot.receitas += toCents(transaction.amount);
    } else if (transaction.kind === "expense") {
      slot.despesas += toCents(transaction.amount);
    }
  }

  return period.months.map((bucket, index) => ({
    month: bucket.label,
    receitas: (cents[index]?.receitas ?? 0) / 100,
    despesas: (cents[index]?.despesas ?? 0) / 100,
  }));
}

function buildExpenseComposition(
  transactions: readonly ReportTransaction[],
  categories: readonly ReportCategory[],
): ReportCategorySlice[] {
  const byCategory = new Map<string, { cents: number; count: number }>();

  for (const transaction of transactions) {
    if (transaction.kind !== "expense" || !transaction.categoryId) continue;

    const entry = byCategory.get(transaction.categoryId) ?? {
      cents: 0,
      count: 0,
    };
    entry.cents += toCents(transaction.amount);
    entry.count += 1;
    byCategory.set(transaction.categoryId, entry);
  }

  const total = [...byCategory.values()].reduce(
    (sum, entry) => sum + entry.cents,
    0,
  );
  if (total === 0) return [];

  return categories
    .filter((category) => byCategory.has(category.id))
    .map((category): ReportCategorySlice => {
      const entry = byCategory.get(category.id);
      const cents = entry?.cents ?? 0;

      return {
        id: category.id,
        name: category.name,
        color: category.color,
        icon: resolveCategoryIconKey(category),
        value: cents / 100,
        percentage: Math.round((cents / total) * 100),
        transactionCount: entry?.count ?? 0,
      };
    })
    .sort((a, b) => b.value - a.value);
}

// Orçamento do período = limite mensal × meses. Num relatório trimestral o
// limite de R$ 800/mês vira R$ 2.400 — é o que torna a comparação honesta.
function buildBudgetUsage(
  composition: readonly ReportCategorySlice[],
  categories: readonly ReportCategory[],
  monthCount: number,
): ReportBudgetItem[] {
  const amountById = new Map(
    composition.map((slice) => [slice.id, slice.value]),
  );

  return categories
    .filter(
      (category) =>
        category.kind === "expense" && category.monthlyBudget !== null,
    )
    .map((category): ReportBudgetItem => {
      const budget = roundMoney(Number(category.monthlyBudget) * monthCount);

      return {
        id: category.id,
        name: category.name,
        color: category.color,
        amount: amountById.get(category.id) ?? 0,
        budget,
      };
    })
    .filter((item) => item.budget > 0)
    .sort((a, b) => b.amount / b.budget - a.amount / a.budget);
}

function findLargestExpense(
  transactions: readonly ReportTransaction[],
): { description: string; amount: number } | null {
  const expenses = transactions.filter(
    (transaction) => transaction.kind === "expense",
  );
  if (expenses.length === 0) return null;

  const largest = expenses.reduce((max, transaction) =>
    toCents(transaction.amount) > toCents(max.amount) ? transaction : max,
  );

  return {
    description: largest.description?.trim() || "Sem descrição",
    amount: roundMoney(Number(largest.amount)),
  };
}

function findMostFrequentCategory(
  composition: readonly ReportCategorySlice[],
): { name: string; count: number } | null {
  if (composition.length === 0) return null;

  const most = composition.reduce((max, slice) =>
    slice.transactionCount > max.transactionCount ? slice : max,
  );

  return { name: most.name, count: most.transactionCount };
}

// Resumo em prosa, montado a partir dos números já calculados. Tom de copiloto:
// observa, não julga; sem promessa absoluta.
function buildHighlight(
  period: ResolvedReportPeriod,
  balance: number,
  expenses: ReportMetric,
  budgetUsage: readonly ReportBudgetItem[],
  transactionCount: number,
): { title: string; description: string; source: string } {
  const over = budgetUsage.filter((item) => item.amount > item.budget);
  const parts: string[] = [];

  if (balance > 0) {
    parts.push(
      `Você fechou ${period.label} com ${formatBRL(balance)} de sobra.`,
    );
  } else if (balance < 0) {
    parts.push(
      `Em ${period.label} as saídas superaram as entradas em ${formatBRL(Math.abs(balance))}.`,
    );
  } else {
    parts.push(`Em ${period.label} entradas e saídas ficaram equilibradas.`);
  }

  if (expenses.deltaPercentage !== null) {
    const direction = expenses.deltaPercentage > 0 ? "acima" : "abaixo";
    parts.push(
      `As despesas ficaram ${Math.abs(expenses.deltaPercentage).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% ${direction} do período anterior.`,
    );
  }

  if (over.length === 0) {
    parts.push("Nenhum orçamento de categoria foi estourado.");
  } else {
    const names = over.map((item) => item.name).join(", ");
    parts.push(
      over.length === 1
        ? `O orçamento de ${names} passou do limite — ajustar essa categoria já recolocaria o período no planejado.`
        : `Os orçamentos de ${names} passaram do limite — pequenos ajustes nessas categorias recolocariam o período no planejado.`,
    );
  }

  return {
    title: `Resumo de ${period.label}`,
    description: parts.join(" "),
    source: `Calculado a partir de ${transactionCount} ${transactionCount === 1 ? "transação" : "transações"} de ${period.label}, comparadas ao período anterior de igual duração.`,
  };
}

export function buildReport(
  period: ResolvedReportPeriod,
  transactions: readonly ReportTransaction[],
  previousTransactions: readonly ReportTransaction[],
  categories: readonly ReportCategory[],
): ReportSummary {
  const incomeCents = sumCents(transactions, "income");
  const expenseCents = sumCents(transactions, "expense");
  const previousIncomeCents = sumCents(previousTransactions, "income");
  const previousExpenseCents = sumCents(previousTransactions, "expense");

  const income: ReportMetric = {
    value: incomeCents / 100,
    deltaPercentage: percentageChange(incomeCents, previousIncomeCents),
  };
  const expenses: ReportMetric = {
    value: expenseCents / 100,
    deltaPercentage: percentageChange(expenseCents, previousExpenseCents),
  };
  const balance = (incomeCents - expenseCents) / 100;

  const expenseComposition = buildExpenseComposition(transactions, categories);
  const budgetUsage = buildBudgetUsage(
    expenseComposition,
    categories,
    period.monthCount,
  );

  // Último dia do período, inclusivo — o que o usuário vê como "até".
  const lastDay = new Date(period.toExclusive.getTime() - 86_400_000);

  return {
    period: {
      granularity: period.granularity,
      key: period.key,
      label: period.label,
      from: toDateKey(period.from),
      to: toDateKey(lastDay),
      monthCount: period.monthCount,
    },
    income,
    expenses,
    balance,
    savingsRate:
      incomeCents > 0 ? (incomeCents - expenseCents) / incomeCents : null,
    transactionCount: transactions.length,
    largestExpense: findLargestExpense(transactions),
    mostFrequentCategory: findMostFrequentCategory(expenseComposition),
    series: buildSeries(transactions, period),
    expenseComposition,
    budgetUsage,
    highlight: buildHighlight(
      period,
      balance,
      expenses,
      budgetUsage,
      transactions.length,
    ),
  };
}
