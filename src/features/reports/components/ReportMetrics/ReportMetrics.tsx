import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  RepeatIcon,
  TrendingUpIcon,
} from "lucide-react";

import { MetricCard } from "@/components/app/MetricCard";
import type { ReportMetric, ReportSummary } from "@/features/reports/types";
import { formatMoney } from "@/lib/money";

type ReportMetricsProps = Readonly<{ report: ReportSummary }>;

function formatDelta(metric: ReportMetric): string | undefined {
  if (metric.deltaPercentage === null) return undefined;

  const sign = metric.deltaPercentage > 0 ? "+" : "";
  return `${sign}${metric.deltaPercentage.toLocaleString("pt-BR", {
    maximumFractionDigits: 1,
  })}% vs. período anterior`;
}

function ReportMetrics({ report }: ReportMetricsProps) {
  return (
    <section
      aria-label="Métricas do período"
      className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4"
    >
      <MetricCard
        label="Entradas"
        value={formatMoney(report.income.value)}
        icon={ArrowDownLeftIcon}
        trend={formatDelta(report.income)}
        trendUp={(report.income.deltaPercentage ?? 0) >= 0}
      />
      <MetricCard
        label="Saídas"
        value={formatMoney(report.expenses.value)}
        icon={ArrowUpRightIcon}
        trend={formatDelta(report.expenses)}
        // Despesa subindo é o sinal ruim — a leitura da cor é invertida.
        trendUp={(report.expenses.deltaPercentage ?? 0) <= 0}
      />
      <MetricCard
        label="Maior gasto"
        value={
          report.largestExpense
            ? formatMoney(report.largestExpense.amount)
            : "—"
        }
        icon={TrendingUpIcon}
        caption={report.largestExpense?.description}
      />
      <MetricCard
        label="Mais frequente"
        value={report.mostFrequentCategory?.name ?? "—"}
        icon={RepeatIcon}
        caption={
          report.mostFrequentCategory
            ? `${report.mostFrequentCategory.count} ${
                report.mostFrequentCategory.count === 1
                  ? "lançamento"
                  : "lançamentos"
              }`
            : undefined
        }
      />
    </section>
  );
}

export { ReportMetrics };
