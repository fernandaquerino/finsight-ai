import { getMonthName } from "@/lib/date";

export type MonthParam = {
  year: number;
  month: number; // 1-12
};

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

// Lê "?month=YYYY-MM". Inválido/ausente → mês corrente de `now`.
export function parseMonthParam(
  value: string | undefined,
  now: Date = new Date(),
): MonthParam {
  if (value && /^\d{4}-\d{2}$/.test(value)) {
    const [year, month] = value.split("-").map(Number);
    if (year && month && month >= 1 && month <= 12) {
      return { year, month };
    }
  }

  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export function monthParamToString(month: MonthParam): string {
  return `${month.year}-${pad(month.month)}`;
}

// Range inclusivo do mês como query para resolvePeriod (from/to).
export function monthParamToPeriodQuery(month: MonthParam): {
  from: string;
  to: string;
} {
  const lastDay = new Date(month.year, month.month, 0).getDate();
  return {
    from: `${month.year}-${pad(month.month)}-01`,
    to: `${month.year}-${pad(month.month)}-${pad(lastDay)}`,
  };
}

// Date local (meia-noite do dia 1) — usado pelo seletor. Determinístico no
// server e no client (não usa parsing UTC de string).
export function monthParamToDate(month: MonthParam): Date {
  return new Date(month.year, month.month - 1, 1);
}

export function monthParamLabel(month: MonthParam): string {
  return getMonthName(monthParamToDate(month));
}
