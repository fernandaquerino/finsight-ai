import { debtRepository, type Database } from "@/server/repositories";

import {
  compareStrategies,
  monthlyInterestEstimate,
  orderByStrategy,
  simulatePayoff,
  type DebtStrategy,
  type PayoffSimulation,
  type StrategyComparison,
  type SimulationDebt,
} from "./strategy";

export type { DebtStrategy } from "./strategy";

export type DebtKind =
  | "credit_card"
  | "personal_loan"
  | "financing"
  | "consumer_credit"
  | "other";

// "attention" quando a parcela não cobre os juros do mês: o saldo cresce mesmo
// pagando em dia. É o sinal que mais importa mostrar ao usuário.
export type DebtStatus = "on-track" | "attention" | "settled";

export type DebtSummaryItem = Readonly<{
  id: string;
  name: string;
  kind: DebtKind;
  totalAmount: number;
  remainingAmount: number;
  paidAmount: number;
  monthlyPayment: number | null;
  interestRate: number;
  dueDay: number | null;
  // paidAmount / totalAmount, limitado a [0, 1].
  paidRatio: number;
  // Juros que esta dívida acumula no próximo mês se nada for pago.
  monthlyInterest: number;
  status: DebtStatus;
  // Primeira da fila na estratégia escolhida.
  isFocus: boolean;
}>;

export type DebtRecommendation = Readonly<{
  title: string;
  description: string;
  // De onde os números vieram — exigido para qualquer número financeiro na UI.
  source: string;
}>;

export type DebtsSummary = Readonly<{
  strategy: DebtStrategy;
  extraMonthly: number;
  items: readonly DebtSummaryItem[];
  totals: Readonly<{
    remaining: number;
    monthlyPayment: number;
    monthlyInterest: number;
    debtCount: number;
  }>;
  focusDebtName: string | null;
  simulation: PayoffSimulation;
  comparison: StrategyComparison;
  recommendation: DebtRecommendation | null;
}>;

export type DebtRow = Readonly<{
  id: string;
  name: string;
  kind: DebtKind;
  totalAmount: string;
  remainingAmount: string;
  monthlyPayment: string | null;
  interestRate: string;
  dueDay: number | null;
}>;

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function formatBRL(value: number): string {
  return `R$ ${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatRate(value: number): string {
  return `${value.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}% a.m.`;
}

function pluralMonths(months: number): string {
  return months === 1 ? "1 mês" : `${months} meses`;
}

const strategyLabels: Record<DebtStrategy, string> = {
  avalanche: "avalanche",
  snowball: "bola de neve",
};

// Texto da recomendação: montado a partir dos números da simulação, com fonte
// citada e sem promessa absoluta ("pode economizar", não "vai economizar").
function buildRecommendation(
  focus: DebtSummaryItem | undefined,
  strategy: DebtStrategy,
  comparison: StrategyComparison,
  simulation: PayoffSimulation,
  extraMonthly: number,
  debtCount: number,
): DebtRecommendation | null {
  if (!focus) return null;

  const parts: string[] = [
    `Entre suas dívidas, ${focus.name} (${formatRate(focus.interestRate)}) é a que mais custa em juros: ${formatBRL(focus.monthlyInterest)} no próximo mês.`,
  ];

  if (simulation.months !== null) {
    const extra =
      extraMonthly > 0
        ? ` com o aporte extra de ${formatBRL(extraMonthly)} por mês`
        : " mantendo as parcelas atuais";
    parts.push(
      `Pela estratégia ${strategyLabels[strategy]}${extra}, a estimativa é quitar tudo em ${pluralMonths(simulation.months)}, pagando ${formatBRL(simulation.totalInterest)} de juros no total.`,
    );
  } else {
    parts.push(
      "Com as parcelas atuais o saldo não diminui — os juros consomem o pagamento. Vale renegociar a taxa ou aumentar o valor pago por mês.",
    );
  }

  if (comparison.interestSaved > 0) {
    const other =
      comparison.recommended === "avalanche" ? "bola de neve" : "avalanche";
    parts.push(
      `Comparada à ${other}, a ${strategyLabels[comparison.recommended]} pode economizar até ${formatBRL(comparison.interestSaved)} em juros.`,
    );
  }

  return {
    title: `Priorize ${focus.name}`,
    description: parts.join(" "),
    source: `Simulação ${strategyLabels[strategy]} sobre ${debtCount} ${debtCount === 1 ? "dívida" : "dívidas"} · estimativa com base nos saldos, parcelas e taxas informados por você. Não é aconselhamento financeiro.`,
  };
}

function toSimulationDebt(item: DebtSummaryItem): SimulationDebt {
  return {
    id: item.id,
    remainingAmount: item.remainingAmount,
    interestRate: item.interestRate,
    monthlyPayment: item.monthlyPayment ?? 0,
  };
}

// Função pura: linhas do banco (numeric como string) → contrato da UI.
export function buildDebtsSummary(
  rows: readonly DebtRow[],
  strategy: DebtStrategy,
  extraMonthly = 0,
): DebtsSummary {
  const base = rows.map((row) => {
    const totalAmount = roundMoney(Number(row.totalAmount));
    const remainingAmount = roundMoney(Number(row.remainingAmount));
    const monthlyPayment =
      row.monthlyPayment === null
        ? null
        : roundMoney(Number(row.monthlyPayment));
    const interestRate = Number(row.interestRate);
    const paidAmount = roundMoney(Math.max(0, totalAmount - remainingAmount));
    const monthlyInterest = roundMoney(remainingAmount * (interestRate / 100));

    let status: DebtStatus;
    if (remainingAmount <= 0) {
      status = "settled";
    } else if ((monthlyPayment ?? 0) <= monthlyInterest) {
      status = "attention";
    } else {
      status = "on-track";
    }

    return {
      id: row.id,
      name: row.name,
      kind: row.kind,
      totalAmount,
      remainingAmount,
      paidAmount,
      monthlyPayment,
      interestRate,
      dueDay: row.dueDay,
      paidRatio:
        totalAmount > 0
          ? Math.min(1, Math.max(0, paidAmount / totalAmount))
          : 0,
      monthlyInterest,
      status,
      isFocus: false,
    } satisfies DebtSummaryItem;
  });

  // Só dívidas em aberto entram na estratégia — quitadas vão para o fim da lista.
  const open = base.filter((item) => item.remainingAmount > 0);
  const settled = base.filter((item) => item.remainingAmount <= 0);

  const ordered = orderByStrategy(
    open.map((item) => ({ ...toSimulationDebt(item), item })),
    strategy,
  ).map((entry) => entry.item);

  const items: DebtSummaryItem[] = [
    ...ordered.map((item, index) => ({ ...item, isFocus: index === 0 })),
    ...settled,
  ];

  const simulationInput = ordered.map(toSimulationDebt);
  const simulation = simulatePayoff(simulationInput, strategy, extraMonthly);
  const comparison = compareStrategies(simulationInput, extraMonthly);
  const focus = items.find((item) => item.isFocus);

  return {
    strategy,
    extraMonthly: roundMoney(Math.max(0, extraMonthly)),
    items,
    totals: {
      remaining: roundMoney(
        open.reduce((total, item) => total + item.remainingAmount, 0),
      ),
      monthlyPayment: roundMoney(
        open.reduce((total, item) => total + (item.monthlyPayment ?? 0), 0),
      ),
      monthlyInterest: roundMoney(monthlyInterestEstimate(simulationInput)),
      debtCount: open.length,
    },
    focusDebtName: focus?.name ?? null,
    simulation,
    comparison,
    recommendation: buildRecommendation(
      focus,
      strategy,
      comparison,
      simulation,
      extraMonthly,
      open.length,
    ),
  };
}

export async function getDebtsSummary(
  db: Database,
  userId: string,
  strategy: DebtStrategy,
  extraMonthly = 0,
): Promise<DebtsSummary> {
  const rows = await debtRepository.listByUser(db, userId);

  return buildDebtsSummary(rows, strategy, extraMonthly);
}
