import type { ResolvedPeriod } from "@/server/services/dashboard/period";

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// "YYYY-MM" (ou o mês de `now`) → ResolvedPeriod com o mesmo formato de `key`
// que `resolvePeriod` produz, para reusar a chave de cache do dashboard.
export function resolveMonthPeriod(
  month: string | undefined,
  now: Date = new Date(),
): ResolvedPeriod {
  const [year, monthIndex] = month
    ? month.split("-").map(Number)
    : [now.getFullYear(), now.getMonth() + 1];
  const y = year ?? now.getFullYear();
  const m = monthIndex ?? now.getMonth() + 1;

  const from = new Date(y, m - 1, 1);
  const toExclusive = new Date(y, m, 1);
  const toInclusive = new Date(y, m, 0);

  return {
    from,
    toExclusive,
    key: `${toIsoDate(from)}_${toIsoDate(toInclusive)}`,
  };
}

// Rótulo do período para a citação de fonte: "maio de 2026".
export function describeMonth(period: ResolvedPeriod): string {
  return period.from.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
}
