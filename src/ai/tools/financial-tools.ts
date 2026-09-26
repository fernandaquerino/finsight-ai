import { tool, type ToolSet } from "ai";
import { z } from "zod";

import type { Database } from "@/server/repositories";
import { getCategoriesSummary } from "@/server/services/categories/summary";
import { getDashboardSummary } from "@/server/services/dashboard/get-dashboard-summary";
import { getDebtsSummary } from "@/server/services/debts/summary";
import { getGoalsSummary } from "@/server/services/goals/summary";
import { getInsightsSummary } from "@/server/services/insights/summary";
import { listTransactions } from "@/server/services/transactions/list";

import { describeMonth, resolveMonthPeriod } from "./period";

// O contexto das tools é montado no servidor a partir da sessão. `userId`
// NUNCA vem do prompt: o modelo não tem como pedir os dados de outra pessoa
// porque não existe parâmetro para isso em nenhuma tool.
export type FinancialToolsContext = Readonly<{
  db: Database;
  userId: string;
  now?: Date;
}>;

const monthSchema = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/)
  .describe('Mês no formato "YYYY-MM". Omita para o mês corrente.')
  .optional();

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .describe('Data no formato "YYYY-MM-DD".');

// Teto de linhas por tool. Protege o contexto (e o custo) de uma pergunta do
// tipo "me mostre tudo".
const MAX_ROWS = 20;

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function buildFinancialTools(context: FinancialToolsContext): ToolSet {
  const { db, userId } = context;
  const now = context.now ?? new Date();

  return {
    getMonthlySummary: tool({
      description:
        "Receita, despesa, saldo e taxa de economia de um mês. Use para " +
        "perguntas sobre quanto entrou, quanto saiu ou como o mês fechou.",
      inputSchema: z.object({ month: monthSchema }),
      execute: async ({ month }) => {
        const period = resolveMonthPeriod(month, now);
        const summary = await getDashboardSummary(db, userId, period);

        return {
          month: period.key,
          income: summary.metrics.income,
          expenses: summary.metrics.expenses,
          balance: summary.metrics.balance,
          savingsRate: summary.metrics.savings,
          transactionCount: summary.transactionCount,
          source: `${summary.transactionCount} transações de ${describeMonth(period)}`,
        };
      },
    }),

    getSpendingByCategory: tool({
      description:
        "Total gasto por categoria em um mês, da maior para a menor, com " +
        "orçamento e uso do orçamento quando houver. Use para 'onde gastei " +
        "mais', 'estourei algum orçamento', comparações entre categorias.",
      inputSchema: z.object({
        month: monthSchema,
        limit: z
          .number()
          .int()
          .min(1)
          .max(MAX_ROWS)
          .describe("Quantas categorias retornar. Padrão 8.")
          .optional(),
      }),
      execute: async ({ month, limit }) => {
        const summary = await getCategoriesSummary(db, userId, month);
        const period = resolveMonthPeriod(summary.month, now);

        const categories = summary.items
          .filter((item) => item.kind === "expense" && item.amount > 0)
          .sort((a, b) => b.amount - a.amount)
          .slice(0, limit ?? 8)
          .map((item) => ({
            name: item.name,
            amount: item.amount,
            transactionCount: item.monthTransactionCount,
            monthlyBudget: item.monthlyBudget,
            budgetUsage:
              item.budgetUsage === null ? null : roundMoney(item.budgetUsage),
            budgetStatus: item.budgetStatus,
            shareOfExpenses:
              summary.totals.expense > 0
                ? roundMoney(item.amount / summary.totals.expense)
                : null,
          }));

        return {
          month: summary.month,
          totalExpenses: summary.totals.expense,
          categories,
          source: `despesas de ${describeMonth(period)} agrupadas por categoria`,
        };
      },
    }),

    searchTransactions: tool({
      description:
        "Lista transações do usuário com filtros de data, tipo e busca " +
        "textual na descrição. Use para confirmar lançamentos específicos, " +
        "achar uma cobrança pelo nome ou detalhar um valor já citado.",
      inputSchema: z.object({
        from: isoDateSchema.optional(),
        to: isoDateSchema.optional(),
        search: z
          .string()
          .max(120)
          .describe("Trecho da descrição, ex.: 'Spotify'.")
          .optional(),
        kind: z.enum(["income", "expense", "transfer"]).optional(),
        limit: z.number().int().min(1).max(MAX_ROWS).optional(),
      }),
      execute: async ({ from, to, search, kind, limit }) => {
        const result = await listTransactions(db, userId, {
          from,
          to,
          search,
          kind,
          page: 1,
          limit: limit ?? 10,
        });

        return {
          total: result.total,
          returned: result.items.length,
          transactions: result.items.map((item) => ({
            date: item.occurredAt.toISOString().slice(0, 10),
            description: item.description,
            amount: Number(item.amount),
            kind: item.kind,
            category: item.category?.name ?? null,
            account: item.account.name,
            isRecurring: item.isRecurring,
          })),
          source: `${result.items.length} de ${result.total} transações que atendem ao filtro`,
        };
      },
    }),

    getGoalsProgress: tool({
      description:
        "Metas de economia do usuário: quanto já guardou, quanto falta, " +
        "aporte mensal, prazo e projeção de conclusão no ritmo atual.",
      inputSchema: z.object({}),
      execute: async () => {
        const summary = await getGoalsSummary(db, userId);

        return {
          totals: summary.totals,
          goals: summary.items.slice(0, MAX_ROWS).map((goal) => ({
            name: goal.name,
            targetAmount: goal.targetAmount,
            currentAmount: goal.currentAmount,
            remainingAmount: goal.remainingAmount,
            monthlyContribution: goal.monthlyContribution,
            deadline: goal.deadline,
            progress: roundMoney(goal.progress),
            status: goal.status,
            estimatedCompletion: goal.projection.estimatedCompletion,
            requiredMonthlyContribution:
              goal.projection.requiredMonthlyContribution,
          })),
          source: `${summary.totals.goalCount} metas cadastradas e seus aportes`,
        };
      },
    }),

    getDebtsOverview: tool({
      description:
        "Dívidas em aberto, juros mensais e simulação de quitação pela " +
        "estratégia escolhida (avalanche = maior juro primeiro, snowball = " +
        "menor saldo primeiro).",
      inputSchema: z.object({
        strategy: z
          .enum(["avalanche", "snowball"])
          .describe("Padrão: avalanche.")
          .optional(),
        extraMonthly: z
          .number()
          .min(0)
          .describe("Aporte extra mensal a simular, em reais.")
          .optional(),
      }),
      execute: async ({ strategy, extraMonthly }) => {
        const summary = await getDebtsSummary(
          db,
          userId,
          strategy ?? "avalanche",
          extraMonthly ?? 0,
        );

        return {
          strategy: summary.strategy,
          extraMonthly: summary.extraMonthly,
          totals: summary.totals,
          focusDebtName: summary.focusDebtName,
          debts: summary.items.slice(0, MAX_ROWS).map((debt) => ({
            name: debt.name,
            kind: debt.kind,
            remainingAmount: debt.remainingAmount,
            monthlyPayment: debt.monthlyPayment,
            interestRate: debt.interestRate,
            monthlyInterest: debt.monthlyInterest,
            status: debt.status,
            isFocus: debt.isFocus,
          })),
          simulation: summary.simulation,
          recommendation: summary.recommendation,
          source: `${summary.totals.debtCount} dívidas em aberto, estratégia ${summary.strategy}`,
        };
      },
    }),

    getInsights: tool({
      description:
        "Observações já detectadas sobre o mês (assinaturas recorrentes, " +
        "categoria acima da média, possível duplicata, orçamento estourado, " +
        "meta atrasada). Use quando o usuário pedir o que merece atenção.",
      inputSchema: z.object({ month: monthSchema }),
      execute: async ({ month }) => {
        const summary = await getInsightsSummary(db, userId, month);
        const period = resolveMonthPeriod(summary.month, now);

        return {
          month: summary.month,
          counts: summary.counts,
          totals: summary.totals,
          insights: summary.items.slice(0, MAX_ROWS).map((insight) => ({
            severity: insight.severity,
            title: insight.title,
            reason: insight.reason,
            impact: insight.impact,
            impactDirection: insight.impactDirection,
            impactPeriod: insight.impactPeriod,
          })),
          source: `${summary.items.length} observações detectadas em ${describeMonth(period)}`,
        };
      },
    }),
  };
}
