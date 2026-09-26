import { formatShortDate } from "@/lib/date";
import { formatMoney } from "@/lib/money";
import { appRoutes } from "@/lib/app-routes";

import type { Insight, InsightEvidence, InsightSeverity } from "./types";

/* ============================================================
   Entradas
   ============================================================ */

// Transação como o repositório entrega (numeric do Postgres vem como string).
// Deliberadamente estrutural: os detectores são puros e não conhecem Drizzle.
export type InsightTransaction = Readonly<{
  id: string;
  description: string | null;
  amount: string;
  kind: "income" | "expense" | "transfer";
  origin: "manual" | "import" | "recurring" | "integration";
  occurredAt: Date;
  categoryId: string | null;
  isRecurring: boolean;
}>;

export type InsightCategory = Readonly<{
  id: string;
  name: string;
}>;

// Subconjunto de CategorySummaryItem de que o detector de orçamento precisa.
export type InsightBudgetCategory = Readonly<{
  id: string;
  name: string;
  monthlyBudget: number | null;
  amount: number;
  budgetStatus: "none" | "ok" | "warning" | "over";
}>;

// Subconjunto de GoalSummaryItem de que o detector de metas precisa.
export type InsightGoal = Readonly<{
  id: string;
  name: string;
  status: "achieved" | "on-track" | "attention" | "behind" | "unplanned";
  currentAmount: number;
  targetAmount: number;
  monthlyContribution: number | null;
  projection: Readonly<{
    requiredMonthlyContribution: number | null;
    monthsToDeadline: number | null;
    message: string;
  }>;
}>;

/* ============================================================
   Limiares — um lugar só, para que UI, testes e texto concordem
   ============================================================ */

// Mínimo de meses distintos para considerar uma cobrança recorrente.
export const RECURRING_MIN_MONTHS = 3;
// Variação máxima de valor tolerada dentro de um grupo recorrente (15%).
export const RECURRING_MAX_AMOUNT_SPREAD = 1.15;
// Soma mínima de cobranças recorrentes para o insight valer a atenção.
export const RECURRING_MIN_TOTAL = 30;
// Acima de quanto da média histórica a categoria virá como "atenção".
export const ABOVE_AVERAGE_RATIO = 1.15;
// Excesso mínimo em BRL — evita ruído em categorias de valor baixo.
export const ABOVE_AVERAGE_MIN_EXCESS = 50;
// Meses completos anteriores exigidos para haver "média" confiável.
export const ABOVE_AVERAGE_MIN_HISTORY_MONTHS = 3;
// Janela de dias em que dois lançamentos iguais são suspeitos de duplicidade.
export const DUPLICATE_WINDOW_DAYS = 3;
// Quantos insights do mesmo kind no máximo — a tela informa, não inunda.
const MAX_PER_KIND = 2;

/* ============================================================
   Helpers
   ============================================================ */

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function parseAmount(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.abs(parsed) : 0;
}

export function monthKeyOf(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

const MONTH_ABBREVIATIONS = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
] as const;

// "2026-05" -> "mai 2026". Mantém as frases dos insights legíveis em PT-BR
// sem expor a chave técnica do mês ao usuário.
export function formatMonthKey(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  const abbreviation = MONTH_ABBREVIATIONS[(month ?? 1) - 1];

  return abbreviation && year ? `${abbreviation} ${year}` : monthKey;
}

// Normaliza a descrição para agrupar o mesmo comerciante escrito de formas
// diferentes ("UBER *TRIP", "Uber · Centro → Casa" → "uber trip" / "uber centro casa").
// Sem acentos, sem pontuação, sem espaços duplicados.
export function normalizeDescription(description: string | null): string {
  if (!description) return "";

  return description
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const ORIGIN_LABEL = {
  manual: "manual",
  import: "extrato",
  recurring: "recorrente",
  integration: "integração",
} as const satisfies Record<InsightTransaction["origin"], string>;

function categoryNameOf(
  categoryId: string | null,
  categoriesById: ReadonlyMap<string, string>,
): string | null {
  return categoryId ? (categoriesById.get(categoryId) ?? null) : null;
}

function expenseEvidence(
  transaction: InsightTransaction,
  categoriesById: ReadonlyMap<string, string>,
  detail?: string,
): InsightEvidence {
  return {
    description: transaction.description ?? "Sem descrição",
    detail:
      detail ??
      `${formatShortDate(transaction.occurredAt)} · ${ORIGIN_LABEL[transaction.origin]}`,
    categoryName: categoryNameOf(transaction.categoryId, categoriesById),
    amount: -parseAmount(transaction.amount),
  };
}

function isExpense(transaction: InsightTransaction): boolean {
  return transaction.kind === "expense";
}

/* ============================================================
   Agrupamento de cobranças recorrentes (base de 2 detectores)
   ============================================================ */

export type RecurringGroup = Readonly<{
  key: string;
  // Descrição da ocorrência mais recente — a que o usuário reconhece.
  description: string;
  categoryId: string | null;
  // Valor da ocorrência mais recente.
  amount: number;
  // Meses distintos em que a cobrança apareceu, em ordem crescente.
  months: readonly string[];
  lastOccurredAt: Date;
  // Alguma ocorrência já está marcada como recorrente pelo usuário.
  flaggedRecurring: boolean;
  occurrences: number;
}>;

// Agrupa despesas por descrição normalizada e mantém só os grupos que se
// repetem em RECURRING_MIN_MONTHS meses distintos com valor estável.
// Valor estável = maior/menor <= RECURRING_MAX_AMOUNT_SPREAD, o que tolera
// reajuste pequeno de assinatura sem juntar compras avulsas de valor variado.
export function groupRecurringCharges(
  transactions: readonly InsightTransaction[],
): readonly RecurringGroup[] {
  const buckets = new Map<string, InsightTransaction[]>();

  for (const transaction of transactions) {
    if (!isExpense(transaction)) continue;

    const key = normalizeDescription(transaction.description);
    if (!key) continue;

    const bucket = buckets.get(key);
    if (bucket) {
      bucket.push(transaction);
    } else {
      buckets.set(key, [transaction]);
    }
  }

  const groups: RecurringGroup[] = [];

  for (const [key, bucket] of buckets) {
    const months = [
      ...new Set(bucket.map((t) => monthKeyOf(t.occurredAt))),
    ].sort();
    if (months.length < RECURRING_MIN_MONTHS) continue;

    const amounts = bucket.map((t) => parseAmount(t.amount));
    const min = Math.min(...amounts);
    const max = Math.max(...amounts);
    if (min <= 0 || max / min > RECURRING_MAX_AMOUNT_SPREAD) continue;

    const latest = bucket.reduce((newest, current) =>
      current.occurredAt > newest.occurredAt ? current : newest,
    );

    groups.push({
      key,
      description: latest.description ?? "Sem descrição",
      categoryId: latest.categoryId,
      amount: roundMoney(parseAmount(latest.amount)),
      months,
      lastOccurredAt: latest.occurredAt,
      flaggedRecurring: bucket.some((t) => t.isRecurring),
      occurrences: bucket.length,
    });
  }

  // Maior valor primeiro: é a cobrança que mais pesa na decisão.
  return groups.sort((a, b) => b.amount - a.amount);
}

/* ============================================================
   1. Cobranças recorrentes que valem revisão (oportunidade)
   ============================================================ */

// Deliberadamente NÃO afirma "assinatura pouco usada": o app não tem dado de
// uso. Afirma só o que os lançamentos provam — que a cobrança se repete.
export function detectRecurringCharges(
  groups: readonly RecurringGroup[],
  monthKey: string,
  categoriesById: ReadonlyMap<string, string>,
): Insight | null {
  const active = groups.filter((group) => group.months.includes(monthKey));
  if (active.length < 2) return null;

  const monthlyTotal = roundMoney(
    active.reduce((sum, group) => sum + group.amount, 0),
  );
  if (monthlyTotal < RECURRING_MIN_TOTAL) return null;

  const annualTotal = roundMoney(monthlyTotal * 12);
  const occurrences = active.reduce((sum, group) => sum + group.occurrences, 0);
  const windowMonths = new Set(active.flatMap((group) => group.months)).size;

  return {
    id: `recurring-charges:${monthKey}`,
    kind: "recurring-charges",
    severity: "opportunity",
    title: "Cobranças recorrentes que valem uma revisão",
    reason: `Encontrei ${active.length} cobranças que se repetem todo mês e somam ${formatMoney(monthlyTotal)}.`,
    headline: `Essas ${active.length} cobranças custam ${formatMoney(monthlyTotal)} por mês — ${formatMoney(annualTotal)} em um ano. Cancelar as que não fazem mais sentido libera esse valor para uma meta.`,
    impact: monthlyTotal,
    impactDirection: "savings",
    impactPeriod: "monthly",
    impactLabel: `até ${formatMoney(annualTotal)}/ano`,
    source: `Baseado em ${occurrences} cobranças repetidas dos últimos ${windowMonths} meses`,
    evidence: active.slice(0, 5).map((group) => ({
      description: group.description,
      detail: `todo mês desde ${formatMonthKey(group.months[0] ?? monthKey)}`,
      categoryName: categoryNameOf(group.categoryId, categoriesById),
      amount: -group.amount,
    })),
    steps: [
      "Confira quais dessas cobranças você ainda usa",
      "Cancele as que não fazem mais sentido no próprio serviço",
      "Direcione o valor liberado para uma meta de economia",
    ],
    action: {
      label: "Ver lançamentos recorrentes",
      href: `${appRoutes.transactions}?origin=recurring`,
    },
  };
}

/* ============================================================
   2. Nova cobrança recorrente identificada (informativo)
   ============================================================ */

export function detectNewRecurring(
  groups: readonly RecurringGroup[],
  monthKey: string,
  categoriesById: ReadonlyMap<string, string>,
): Insight | null {
  // Acabou de cruzar o limiar (exatamente RECURRING_MIN_MONTHS meses), ainda
  // aparece no mês corrente e o usuário ainda não a marcou como recorrente.
  const candidate = groups.find(
    (group) =>
      group.months.length === RECURRING_MIN_MONTHS &&
      group.months.includes(monthKey) &&
      !group.flaggedRecurring,
  );

  if (!candidate) return null;

  const categoryName = categoryNameOf(candidate.categoryId, categoriesById);

  return {
    id: `new-recurring:${candidate.key}:${monthKey}`,
    kind: "new-recurring",
    severity: "info",
    title: "Nova cobrança recorrente identificada",
    reason: `“${candidate.description}” apareceu em ${RECURRING_MIN_MONTHS} meses seguidos pelo mesmo valor.`,
    headline: `“${candidate.description}” se repetiu em ${RECURRING_MIN_MONTHS} meses seguidos por ${formatMoney(candidate.amount)}. Se for uma cobrança fixa, marcá-la como recorrente melhora suas projeções.`,
    impact: 0,
    impactDirection: "none",
    impactPeriod: "monthly",
    impactLabel: categoryName
      ? `classificada em ${categoryName}`
      : "sem categoria",
    source: `Baseado em ${candidate.occurrences} cobranças de ${formatMonthKey(candidate.months[0] ?? monthKey)} a ${formatMonthKey(monthKey)}`,
    evidence: [
      {
        description: candidate.description,
        detail: `${RECURRING_MIN_MONTHS} meses seguidos · último em ${formatShortDate(candidate.lastOccurredAt)}`,
        categoryName,
        amount: -candidate.amount,
      },
    ],
    steps: [
      "Confirme se a categoria está correta",
      "Marque o lançamento como recorrente para entrar nas projeções",
    ],
    action: {
      label: "Ver lançamento",
      href: `${appRoutes.transactions}?search=${encodeURIComponent(candidate.description)}`,
    },
  };
}

/* ============================================================
   3. Categoria acima da média histórica (atenção)
   ============================================================ */

type CategoryMonthTotals = Map<string, Map<string, number>>;

function sumExpensesByCategoryAndMonth(
  transactions: readonly InsightTransaction[],
): CategoryMonthTotals {
  const totals: CategoryMonthTotals = new Map();

  for (const transaction of transactions) {
    if (!isExpense(transaction) || !transaction.categoryId) continue;

    const month = monthKeyOf(transaction.occurredAt);
    const byMonth = totals.get(transaction.categoryId) ?? new Map();
    byMonth.set(
      month,
      (byMonth.get(month) ?? 0) + parseAmount(transaction.amount),
    );
    totals.set(transaction.categoryId, byMonth);
  }

  return totals;
}

export function detectCategoriesAboveAverage(
  transactions: readonly InsightTransaction[],
  monthKey: string,
  categoriesById: ReadonlyMap<string, string>,
): readonly Insight[] {
  const totals = sumExpensesByCategoryAndMonth(transactions);
  const candidates: Array<{ insight: Insight; excess: number }> = [];

  for (const [categoryId, byMonth] of totals) {
    const current = roundMoney(byMonth.get(monthKey) ?? 0);
    if (current <= 0) continue;

    const previousMonths = [...byMonth.entries()].filter(
      ([month]) => month < monthKey,
    );
    if (previousMonths.length < ABOVE_AVERAGE_MIN_HISTORY_MONTHS) continue;

    const average = roundMoney(
      previousMonths.reduce((sum, [, value]) => sum + value, 0) /
        previousMonths.length,
    );
    if (average <= 0) continue;

    const excess = roundMoney(current - average);
    if (current / average < ABOVE_AVERAGE_RATIO) continue;
    if (excess < ABOVE_AVERAGE_MIN_EXCESS) continue;

    const categoryName = categoriesById.get(categoryId) ?? "Sem categoria";
    const percent = Math.round((current / average - 1) * 100);

    // Os 3 maiores lançamentos do mês na categoria: é a evidência que explica
    // o excesso sem despejar a lista inteira.
    const topTransactions = transactions
      .filter(
        (t) =>
          isExpense(t) &&
          t.categoryId === categoryId &&
          monthKeyOf(t.occurredAt) === monthKey,
      )
      .sort((a, b) => parseAmount(b.amount) - parseAmount(a.amount))
      .slice(0, 3);

    candidates.push({
      excess,
      insight: {
        id: `category-above-average:${categoryId}:${monthKey}`,
        kind: "category-above-average",
        severity: "attention",
        title: `${categoryName} acima da sua média`,
        reason: `Seu gasto com ${categoryName} ficou ${percent}% acima da média dos últimos ${previousMonths.length} meses.`,
        headline: `Você gastou ${formatMoney(current)} com ${categoryName} neste mês, contra uma média de ${formatMoney(average)}. Voltar à média representaria ${formatMoney(excess)}.`,
        impact: excess,
        impactDirection: "overspend",
        impactPeriod: "one-off",
        impactLabel: `${formatMoney(excess)} a mais`,
        source: `Comparação entre ${formatMonthKey(monthKey)} e a média de ${previousMonths.length} meses anteriores`,
        evidence: topTransactions.map((t) =>
          expenseEvidence(t, categoriesById),
        ),
        steps: [
          `Defina um orçamento mensal para ${categoryName}`,
          "Eu aviso quando o gasto se aproximar do limite",
        ],
        action: {
          label: `Ver gastos de ${categoryName}`,
          href: `${appRoutes.transactions}?kind=expense&categoryId=${categoryId}`,
        },
      },
    });
  }

  return candidates
    .sort((a, b) => b.excess - a.excess)
    .slice(0, MAX_PER_KIND)
    .map((candidate) => candidate.insight);
}

/* ============================================================
   4. Possível duplicidade (risco)
   ============================================================ */

function daysBetween(a: Date, b: Date): number {
  return Math.abs(a.getTime() - b.getTime()) / (24 * 60 * 60 * 1000);
}

// Pares de despesas do mês com mesma descrição normalizada, mesmo valor exato
// e até DUPLICATE_WINDOW_DAYS de distância. Cada lançamento entra em no máximo
// um par — duas idas à mesma padaria não viram três "duplicatas".
export function detectPossibleDuplicates(
  transactions: readonly InsightTransaction[],
  monthKey: string,
  categoriesById: ReadonlyMap<string, string>,
): Insight | null {
  const monthExpenses = transactions
    .filter((t) => isExpense(t) && monthKeyOf(t.occurredAt) === monthKey)
    .sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime());

  const paired = new Set<string>();
  const pairs: Array<readonly [InsightTransaction, InsightTransaction]> = [];

  for (let i = 0; i < monthExpenses.length; i += 1) {
    const left = monthExpenses[i];
    if (!left || paired.has(left.id)) continue;

    const leftKey = normalizeDescription(left.description);
    if (!leftKey) continue;

    for (let j = i + 1; j < monthExpenses.length; j += 1) {
      const right = monthExpenses[j];
      if (!right || paired.has(right.id)) continue;
      if (
        daysBetween(left.occurredAt, right.occurredAt) > DUPLICATE_WINDOW_DAYS
      )
        break;
      if (normalizeDescription(right.description) !== leftKey) continue;
      if (parseAmount(right.amount) !== parseAmount(left.amount)) continue;

      paired.add(left.id);
      paired.add(right.id);
      pairs.push([left, right]);
      break;
    }
  }

  if (pairs.length === 0) return null;

  // Só um lado de cada par está "em dúvida": o outro é a compra legítima.
  const amountUnderReview = roundMoney(
    pairs.reduce((sum, [left]) => sum + parseAmount(left.amount), 0),
  );
  const pairLabel = pairs.length === 1 ? "lançamento" : "lançamentos";

  return {
    id: `possible-duplicate:${monthKey}:${pairs.map(([l, r]) => `${l.id}-${r.id}`).join(",")}`,
    kind: "possible-duplicate",
    severity: "risk",
    title:
      pairs.length === 1
        ? "Possível duplicidade em lançamento"
        : `${pairs.length} possíveis duplicidades`,
    reason: `Encontrei ${pairs.length} ${pairLabel} que podem estar lançados duas vezes.`,
    headline: `${pairs.length === 1 ? "Um par de lançamentos idênticos aparece" : `${pairs.length} pares de lançamentos idênticos aparecem`} em datas próximas, somando ${formatMoney(amountUnderReview)} em dúvida. Pode ser a mesma compra registrada duas vezes — só você pode confirmar.`,
    impact: amountUnderReview,
    impactDirection: "review",
    impactPeriod: "one-off",
    impactLabel: `${formatMoney(amountUnderReview)} em dúvida`,
    source: `Comparação de valor, descrição e data entre lançamentos de ${formatMonthKey(monthKey)}`,
    evidence: pairs
      .flat()
      .slice(0, 6)
      .map((t) => expenseEvidence(t, categoriesById)),
    steps: [
      "Confira se foram duas compras distintas",
      "Se for duplicata, exclua o lançamento repetido",
    ],
    action: {
      label: "Revisar lançamentos",
      href: `${appRoutes.transactions}?kind=expense`,
    },
  };
}

/* ============================================================
   5. Orçamento estourado (atenção)
   ============================================================ */

export function detectBudgetOverruns(
  categories: readonly InsightBudgetCategory[],
  monthKey: string,
): readonly Insight[] {
  return categories
    .filter(
      (category) =>
        category.budgetStatus === "over" && category.monthlyBudget !== null,
    )
    .map((category) => {
      const budget = category.monthlyBudget ?? 0;
      const excess = roundMoney(category.amount - budget);
      const percent =
        budget > 0 ? Math.round((category.amount / budget - 1) * 100) : 0;

      return {
        excess,
        insight: {
          id: `budget-overrun:${category.id}:${monthKey}`,
          kind: "budget-overrun",
          severity: "attention",
          title: `Orçamento de ${category.name} estourado`,
          reason: `Você passou ${percent}% do limite que definiu para ${category.name} neste mês.`,
          headline: `${category.name} fechou o mês em ${formatMoney(category.amount)}, ${formatMoney(excess)} acima do orçamento de ${formatMoney(budget)}.`,
          impact: excess,
          impactDirection: "overspend" as const,
          impactPeriod: "one-off" as const,
          impactLabel: `${formatMoney(excess)} acima do limite`,
          source: `Gasto de ${formatMonthKey(monthKey)} comparado ao orçamento da categoria`,
          evidence: [],
          steps: [
            `Revise os lançamentos de ${category.name} do mês`,
            "Ajuste o orçamento se o limite atual não é realista",
          ],
          action: {
            label: "Ajustar orçamento",
            href: appRoutes.categories,
          },
        } satisfies Insight,
      };
    })
    .sort((a, b) => b.excess - a.excess)
    .slice(0, MAX_PER_KIND)
    .map((candidate) => candidate.insight);
}

/* ============================================================
   6. Meta fora do ritmo (atenção)
   ============================================================ */

export function detectGoalsBehind(
  goals: readonly InsightGoal[],
  monthKey: string,
): readonly Insight[] {
  return goals
    .filter((goal) => goal.status === "behind")
    .slice(0, MAX_PER_KIND)
    .map((goal) => {
      const required = goal.projection.requiredMonthlyContribution;
      const current = goal.monthlyContribution ?? 0;
      const gap =
        required !== null ? roundMoney(Math.max(0, required - current)) : 0;

      return {
        id: `goal-behind:${goal.id}:${monthKey}`,
        kind: "goal-behind",
        severity: "attention",
        title: `A meta “${goal.name}” pode atrasar`,
        reason: goal.projection.message,
        headline:
          gap > 0
            ? `Para bater o prazo de “${goal.name}” o aporte precisaria subir ${formatMoney(gap)} por mês, de ${formatMoney(current)} para ${formatMoney(required ?? 0)}. Estender o prazo é a outra saída.`
            : `“${goal.name}” está em ${formatMoney(goal.currentAmount)} de ${formatMoney(goal.targetAmount)} e não tem aporte suficiente para o prazo atual.`,
        impact: gap,
        impactDirection: "none" as const,
        impactPeriod: "monthly" as const,
        impactLabel:
          gap > 0 ? `+${formatMoney(gap)}/mês para o prazo` : "revisar prazo",
        source:
          "Projeção a partir do valor guardado, do aporte informado e do prazo",
        evidence: [],
        steps: [
          gap > 0
            ? `Aumente o aporte mensal para ${formatMoney(required ?? 0)}, ou`
            : "Defina um aporte mensal para a meta, ou",
          "Estenda o prazo para um mês realista",
        ],
        action: {
          label: "Ajustar meta",
          href: appRoutes.goals,
        },
      } satisfies Insight;
    });
}

/* ============================================================
   Ordenação
   ============================================================ */

// Risco primeiro (pode ser dinheiro lançado errado), depois oportunidade
// (dinheiro recuperável), atenção (acompanhar) e informativo (só contexto).
// Dentro da mesma severidade, o maior valor em jogo vem antes.
const SEVERITY_RANK: Record<InsightSeverity, number> = {
  risk: 0,
  opportunity: 1,
  attention: 2,
  info: 3,
};

export function sortInsights(insights: readonly Insight[]): readonly Insight[] {
  return [...insights].sort((a, b) => {
    const rank = SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity];
    return rank !== 0 ? rank : b.impact - a.impact;
  });
}

/* ============================================================
   Orquestração pura
   ============================================================ */

export type DetectInsightsInput = Readonly<{
  monthKey: string;
  // Janela completa (mês corrente + meses anteriores) usada nas comparações.
  transactions: readonly InsightTransaction[];
  categories: readonly InsightCategory[];
  budgetCategories: readonly InsightBudgetCategory[];
  goals: readonly InsightGoal[];
}>;

// Roda todos os detectores sobre dados já carregados. Pura: mesma entrada,
// mesma saída — é este ponto que os testes exercitam.
export function detectInsights(input: DetectInsightsInput): readonly Insight[] {
  const categoriesById = new Map(
    input.categories.map((category) => [category.id, category.name]),
  );
  const groups = groupRecurringCharges(input.transactions);

  const insights = [
    detectRecurringCharges(groups, input.monthKey, categoriesById),
    detectNewRecurring(groups, input.monthKey, categoriesById),
    detectPossibleDuplicates(
      input.transactions,
      input.monthKey,
      categoriesById,
    ),
    ...detectCategoriesAboveAverage(
      input.transactions,
      input.monthKey,
      categoriesById,
    ),
    ...detectBudgetOverruns(input.budgetCategories, input.monthKey),
    ...detectGoalsBehind(input.goals, input.monthKey),
  ].filter((insight): insight is Insight => insight !== null);

  return sortInsights(insights);
}
