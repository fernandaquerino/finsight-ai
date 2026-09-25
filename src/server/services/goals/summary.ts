import { resolveGoalIconKey, type GoalIconKey } from "@/lib/goals";
import { goalRepository, type Database } from "@/server/repositories";

// Abaixo de 80% do aporte necessário a meta vira "atrasada"; entre 80% e 100%,
// "atenção". Limite único para que UI e testes falem do mesmo número.
export const GOAL_ATTENTION_RATIO = 0.8;

export type GoalStatus =
  | "achieved"
  | "on-track"
  | "attention"
  | "behind"
  | "unplanned";

export type GoalProjection = Readonly<{
  // Meses até o alvo mantendo o aporte atual. null sem aporte informado.
  monthsToTarget: number | null;
  // Mês estimado de conclusão no ritmo atual ("YYYY-MM").
  estimatedCompletion: string | null;
  // Meses restantes até o prazo (inclui o mês do prazo). null sem prazo;
  // negativo/zero quando o prazo já passou.
  monthsToDeadline: number | null;
  // Aporte mensal necessário para bater o prazo. null sem prazo.
  requiredMonthlyContribution: number | null;
  // Explicação em PT-BR derivada dos números acima — nunca de um LLM.
  message: string;
}>;

export type GoalSummaryItem = Readonly<{
  id: string;
  name: string;
  icon: GoalIconKey;
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number;
  monthlyContribution: number | null;
  deadline: string | null; // YYYY-MM-DD
  // currentAmount / targetAmount. Pode passar de 1 quando a meta é superada.
  progress: number;
  status: GoalStatus;
  projection: GoalProjection;
}>;

export type GoalsSummary = Readonly<{
  items: readonly GoalSummaryItem[];
  totals: Readonly<{
    saved: number;
    target: number;
    monthlyContribution: number;
    goalCount: number;
    onTrackCount: number;
    // saved / target no conjunto. null quando não há alvo algum.
    averageProgress: number | null;
  }>;
}>;

export type GoalRow = Readonly<{
  id: string;
  name: string;
  icon: string | null;
  targetAmount: string;
  currentAmount: string;
  monthlyContribution: string | null;
  deadline: string | null;
}>;

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function addMonths(year: number, month: number, offset: number): string {
  const date = new Date(year, month - 1 + offset, 1);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

// Meses entre o mês de `now` e o mês do prazo, contando o mês do prazo.
// Prazo no mês corrente → 1. Prazo no mês passado → 0.
export function monthsUntil(deadline: string, now: Date): number {
  const [year, month] = deadline.split("-").map(Number);
  if (!year || !month) return 0;

  return (year - now.getFullYear()) * 12 + (month - (now.getMonth() + 1)) + 1;
}

const monthLabels = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
] as const;

function describeMonth(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  const label = monthLabels[(month ?? 1) - 1] ?? "";
  return `${label} de ${year}`;
}

function buildMessage(
  input: Readonly<{
    status: GoalStatus;
    remaining: number;
    contribution: number | null;
    required: number | null;
    monthsToDeadline: number | null;
    estimatedCompletion: string | null;
  }>,
): string {
  const { status, remaining, contribution, required, monthsToDeadline } = input;

  if (status === "achieved") {
    return "Meta alcançada. Você já tem o valor completo guardado.";
  }

  const missing = formatBRL(remaining);

  if (status === "unplanned") {
    return `Faltam ${missing}. Informe um aporte mensal para eu projetar quando você chega lá.`;
  }

  if (monthsToDeadline !== null && monthsToDeadline <= 0) {
    return `O prazo já passou e faltam ${missing}. Vale rever o valor-alvo ou estender a data.`;
  }

  if (status === "on-track") {
    const completion = input.estimatedCompletion
      ? ` Estimo a conclusão em ${describeMonth(input.estimatedCompletion)}.`
      : "";
    return `Faltam ${missing}. No ritmo de ${formatBRL(contribution ?? 0)} por mês você está dentro do prazo.${completion}`;
  }

  const gap = required !== null ? required - (contribution ?? 0) : null;
  const adjustment =
    gap !== null && gap > 0
      ? ` Aumentar ${formatBRL(gap)} por mês recoloca a meta no prazo.`
      : "";

  if (status === "attention") {
    return `Faltam ${missing} e o aporte atual fica um pouco abaixo do necessário.${adjustment}`;
  }

  return `Faltam ${missing} e o ritmo atual não cobre o prazo.${adjustment}`;
}

function formatBRL(value: number): string {
  return `R$ ${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function buildProjection(
  remaining: number,
  contribution: number | null,
  deadline: string | null,
  now: Date,
): { status: GoalStatus; projection: GoalProjection } {
  const hasContribution = contribution !== null && contribution > 0;
  const monthsToDeadline = deadline ? monthsUntil(deadline, now) : null;

  const monthsToTarget = hasContribution
    ? Math.ceil(remaining / contribution)
    : null;
  const estimatedCompletion =
    monthsToTarget === null
      ? null
      : addMonths(now.getFullYear(), now.getMonth() + 1, monthsToTarget - 1);

  const required =
    monthsToDeadline !== null && monthsToDeadline > 0
      ? roundMoney(remaining / monthsToDeadline)
      : null;

  let status: GoalStatus;
  if (remaining <= 0) {
    status = "achieved";
  } else if (!hasContribution) {
    status = "unplanned";
  } else if (monthsToDeadline !== null && monthsToDeadline <= 0) {
    status = "behind";
  } else if (required === null) {
    // Sem prazo definido não há o que atrasar: há um ritmo e uma estimativa.
    status = "on-track";
  } else if (contribution >= required) {
    status = "on-track";
  } else if (contribution >= required * GOAL_ATTENTION_RATIO) {
    status = "attention";
  } else {
    status = "behind";
  }

  return {
    status,
    projection: {
      monthsToTarget,
      estimatedCompletion,
      monthsToDeadline,
      requiredMonthlyContribution: required,
      message: buildMessage({
        status,
        remaining,
        contribution,
        required,
        monthsToDeadline,
        estimatedCompletion,
      }),
    },
  };
}

// Função pura: recebe as linhas do banco (numeric vem como string) e devolve o
// contrato consumido pela UI. `now` é injetado para tornar o teste determinístico.
export function buildGoalsSummary(
  rows: readonly GoalRow[],
  now: Date = new Date(),
): GoalsSummary {
  const items = rows.map((row): GoalSummaryItem => {
    const targetAmount = roundMoney(Number(row.targetAmount));
    const currentAmount = roundMoney(Number(row.currentAmount));
    const remainingAmount = roundMoney(
      Math.max(0, targetAmount - currentAmount),
    );
    const monthlyContribution =
      row.monthlyContribution === null
        ? null
        : roundMoney(Number(row.monthlyContribution));

    const { status, projection } = buildProjection(
      remainingAmount,
      monthlyContribution,
      row.deadline,
      now,
    );

    return {
      id: row.id,
      name: row.name,
      icon: resolveGoalIconKey(row.icon),
      targetAmount,
      currentAmount,
      remainingAmount,
      monthlyContribution,
      deadline: row.deadline,
      progress: targetAmount > 0 ? currentAmount / targetAmount : 0,
      status,
      projection,
    };
  });

  // Mais próximas da conclusão primeiro; empate por nome.
  const sorted = [...items].sort(
    (a, b) => b.progress - a.progress || a.name.localeCompare(b.name, "pt-BR"),
  );

  const saved = roundMoney(items.reduce((sum, i) => sum + i.currentAmount, 0));
  const target = roundMoney(items.reduce((sum, i) => sum + i.targetAmount, 0));

  return {
    items: sorted,
    totals: {
      saved,
      target,
      monthlyContribution: roundMoney(
        items.reduce((sum, i) => sum + (i.monthlyContribution ?? 0), 0),
      ),
      goalCount: items.length,
      onTrackCount: items.filter(
        (item) => item.status === "on-track" || item.status === "achieved",
      ).length,
      averageProgress: target > 0 ? saved / target : null,
    },
  };
}

export async function getGoalsSummary(
  db: Database,
  userId: string,
): Promise<GoalsSummary> {
  const rows = await goalRepository.listByUser(db, userId);

  return buildGoalsSummary(rows);
}
