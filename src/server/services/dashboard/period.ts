import type { DashboardQuery } from "@/server/validators/dashboard";

// Período resolvido para consulta: [from, toExclusive). `toExclusive` é o início
// do dia seguinte ao `to` inclusivo, para um range half-open seguro em SQL.
// `key` identifica o período de forma estável (usado na chave de cache).
export type ResolvedPeriod = {
  from: Date;
  toExclusive: Date;
  key: string;
};

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Constrói um Date local (meia-noite) a partir de "YYYY-MM-DD", evitando o
// parsing UTC de new Date(string), que desloca o dia conforme o fuso.
function parseLocalDate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1);
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfNextMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

// Resolve o período a partir da query. Sem from/to → mês corrente (de `now`).
export function resolvePeriod(
  query: DashboardQuery,
  now: Date = new Date(),
): ResolvedPeriod {
  if (query.from && query.to) {
    const from = parseLocalDate(query.from);
    const toExclusive = addDays(parseLocalDate(query.to), 1);
    return { from, toExclusive, key: `${query.from}_${query.to}` };
  }

  const from = startOfMonth(now);
  const toExclusive = startOfNextMonth(now);
  return {
    from,
    toExclusive,
    key: `${toIsoDate(from)}_${toIsoDate(addDays(toExclusive, -1))}`,
  };
}
