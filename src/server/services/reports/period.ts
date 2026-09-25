// Resolução de período do relatório. Mensal, trimestral e anual são ancorados
// num mês (YYYY-MM): o trimestre é o que contém o mês, o ano é o do mês.
// Todas as datas são locais — o mesmo critério usado pelo dashboard.

export type ReportGranularity = "monthly" | "quarterly" | "yearly";

export type ReportMonthBucket = Readonly<{
  year: number;
  monthIndex: number; // 0-11
  label: string;
}>;

export type ResolvedReportPeriod = Readonly<{
  granularity: ReportGranularity;
  // Chave estável para cache e query key ("2026-05", "2026-Q2", "2026").
  key: string;
  label: string;
  from: Date;
  toExclusive: Date;
  // Período imediatamente anterior, de igual duração — base das variações.
  previousFrom: Date;
  previousToExclusive: Date;
  // Meses do período, do mais antigo ao mais recente (eixo X da série).
  months: readonly ReportMonthBucket[];
  monthCount: number;
}>;

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

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const;

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function buildMonths(
  year: number,
  startMonthIndex: number,
  count: number,
): ReportMonthBucket[] {
  return Array.from({ length: count }, (_, offset) => {
    const date = new Date(year, startMonthIndex + offset, 1);
    return {
      year: date.getFullYear(),
      monthIndex: date.getMonth(),
      label: MONTH_LABELS[date.getMonth()] ?? "",
    };
  });
}

export function resolveReportPeriod(
  granularity: ReportGranularity,
  month: string | undefined,
  now: Date = new Date(),
): ResolvedReportPeriod {
  const [parsedYear, parsedMonth] = month
    ? month.split("-").map(Number)
    : [now.getFullYear(), now.getMonth() + 1];
  const year = parsedYear ?? now.getFullYear();
  const monthNumber = parsedMonth ?? now.getMonth() + 1;
  const monthIndex = monthNumber - 1;

  const { startMonthIndex, monthCount, key, label } = (() => {
    if (granularity === "yearly") {
      return {
        startMonthIndex: 0,
        monthCount: 12,
        key: String(year),
        label: String(year),
      };
    }

    if (granularity === "quarterly") {
      const quarter = Math.floor(monthIndex / 3);
      return {
        startMonthIndex: quarter * 3,
        monthCount: 3,
        key: `${year}-Q${quarter + 1}`,
        label: `${quarter + 1}º trimestre de ${year}`,
      };
    }

    return {
      startMonthIndex: monthIndex,
      monthCount: 1,
      key: `${year}-${pad(monthNumber)}`,
      label: `${MONTH_NAMES[monthIndex] ?? ""} de ${year}`,
    };
  })();

  const from = new Date(year, startMonthIndex, 1);
  const toExclusive = new Date(year, startMonthIndex + monthCount, 1);

  return {
    granularity,
    key,
    label,
    from,
    toExclusive,
    previousFrom: new Date(year, startMonthIndex - monthCount, 1),
    previousToExclusive: from,
    months: buildMonths(year, startMonthIndex, monthCount),
    monthCount,
  };
}
