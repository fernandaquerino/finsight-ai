"use client";

import { useState } from "react";
import { BarChart3Icon } from "lucide-react";

import { AIInsightBanner } from "@/components/app/AIInsightBanner";
import { ChartCard } from "@/components/app/ChartCard";
import { MonthYearPicker } from "@/components/app/MonthYearPicker";
import { BarChart } from "@/components/charts/BarChart";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { CHART_COLORS } from "@/lib/chart-colors";
// Componentes de apresentação puros (dados chegam prontos). Reaproveitados da
// feature de categorias — candidatos a subir para components/charts quando uma
// terceira tela precisar deles.
import { CategoryBudgetBars } from "@/features/categories/components/CategoryBudgetBars";
import { CategorySpendDonut } from "@/features/categories/components/CategorySpendDonut";
import { ReportExportActions } from "@/features/reports/components/ReportExportActions";
import { ReportMetrics } from "@/features/reports/components/ReportMetrics";
import { useReport } from "@/features/reports/hooks/useReport";
import type {
  ReportGranularity,
  ReportSummary,
} from "@/features/reports/types";
import { formatMoney } from "@/lib/money";

type ReportsScreenProps = Readonly<{
  initialGranularity: ReportGranularity;
  initialMonth: string;
}>;

const granularityOptions = [
  { value: "monthly", label: "Mensal" },
  { value: "quarterly", label: "Trimestral" },
  { value: "yearly", label: "Anual" },
] as const;

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function monthKeyToDate(month: string): Date {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Date(year ?? 1970, (monthNumber ?? 1) - 1, 1);
}

function dateToMonthKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

function ReportsLoading() {
  return (
    <div
      className="space-y-5"
      aria-busy="true"
      aria-label="Carregando relatório"
    >
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-[116px] rounded-lg" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-[300px] rounded-lg" />
        <Skeleton className="h-[300px] rounded-lg" />
      </div>
      <Skeleton className="h-[220px] rounded-lg" />
    </div>
  );
}

function ChartLegend() {
  return (
    <div className="mt-3 flex items-center justify-center gap-6">
      {[
        { label: "Receitas", color: CHART_COLORS.success },
        { label: "Despesas", color: CHART_COLORS.danger },
      ].map((series) => (
        <div key={series.label} className="flex items-center gap-1.5">
          <span
            className="size-2.5 rounded-sm"
            style={{ background: series.color }}
            aria-hidden="true"
          />
          <span className="text-xs text-muted-foreground">{series.label}</span>
        </div>
      ))}
    </div>
  );
}

function ReportContent({ report }: Readonly<{ report: ReportSummary }>) {
  const { period } = report;
  const hasMovement = report.income.value > 0 || report.expenses.value > 0;

  if (!hasMovement) {
    return (
      <EmptyState
        icon={BarChart3Icon}
        title={`Nenhum lançamento em ${period.label}`}
        description="Escolha outro período ou registre transações para ver o relatório."
      />
    );
  }

  return (
    <>
      <ReportMetrics report={report} />

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Receitas vs. despesas"
          subtitle={
            period.monthCount === 1
              ? period.label
              : `Evolução de ${period.monthCount} meses`
          }
        >
          <BarChart
            data={[...report.series]}
            height={220}
            aria-label={`Gráfico de barras de receitas e despesas em ${period.label}`}
          />
          <ChartLegend />
        </ChartCard>

        <ChartCard
          title="Composição de gastos"
          subtitle={`${formatMoney(report.expenses.value)} em ${period.label}`}
          isEmpty={report.expenseComposition.length === 0}
          emptyMessage="Nenhuma despesa categorizada no período"
        >
          <CategorySpendDonut
            slices={report.expenseComposition.map((slice) => ({
              id: slice.id,
              name: slice.name,
              value: slice.value,
              percentage: slice.percentage,
              color: slice.color,
            }))}
            ariaLabel={`Gráfico de rosca da composição de gastos em ${period.label}`}
          />
        </ChartCard>
      </div>

      {report.budgetUsage.length > 0 ? (
        <ChartCard
          title="Orçamento por categoria"
          subtitle={
            period.monthCount === 1
              ? `Quanto você usou de cada limite em ${period.label}`
              : `Limite mensal × ${period.monthCount} meses`
          }
        >
          <CategoryBudgetBars items={report.budgetUsage} />
        </ChartCard>
      ) : null}

      <AIInsightBanner
        label="RESUMO DO PERÍODO"
        title={report.highlight.title}
        description={report.highlight.description}
        source={report.highlight.source}
        metric={{ label: "Resultado", value: formatMoney(report.balance) }}
      />

      <p className="sr-only" aria-live="polite">
        {`Relatório de ${period.label}. Entradas ${formatMoney(
          report.income.value,
        )}, saídas ${formatMoney(report.expenses.value)}, resultado ${formatMoney(
          report.balance,
        )}.`}
      </p>
    </>
  );
}

function ReportsScreen({
  initialGranularity,
  initialMonth,
}: ReportsScreenProps) {
  const [granularity, setGranularity] =
    useState<ReportGranularity>(initialGranularity);
  const [month, setMonth] = useState(initialMonth);
  const reportQuery = useReport(granularity, month);

  // Deep-link do período sem navegação (mesmo padrão dos outros filtros).
  function syncUrl(nextGranularity: ReportGranularity, nextMonth: string) {
    const query = new URLSearchParams({
      granularity: nextGranularity,
      month: nextMonth,
    });
    window.history.replaceState(null, "", `?${query}`);
  }

  function handleGranularityChange(value: string) {
    const next = value as ReportGranularity;
    setGranularity(next);
    syncUrl(next, month);
  }

  function handleMonthChange(date: Date) {
    const next = dateToMonthKey(date);
    setMonth(next);
    syncUrl(granularity, next);
  }

  return (
    <main className="mx-auto flex w-full max-w-[1240px] flex-col gap-5 p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <Tabs value={granularity} onValueChange={handleGranularityChange}>
            <TabsList aria-label="Granularidade do relatório">
              {granularityOptions.map((option) => (
                <TabsTrigger key={option.value} value={option.value}>
                  {option.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <MonthYearPicker
            value={monthKeyToDate(month)}
            onChange={handleMonthChange}
          />
        </div>
        <ReportExportActions
          granularity={granularity}
          month={month}
          disabled={reportQuery.isPending || reportQuery.isError}
        />
      </div>

      {granularity !== "monthly" ? (
        <p className="text-xs text-muted-foreground">
          {granularity === "quarterly"
            ? "O trimestre é o que contém o mês selecionado."
            : "O ano é o do mês selecionado."}
        </p>
      ) : null}

      {reportQuery.isPending ? (
        <ReportsLoading />
      ) : reportQuery.isError ? (
        <ErrorState
          title="Não foi possível gerar o relatório"
          description="Tente novamente em instantes."
          onRetry={() => void reportQuery.refetch()}
        />
      ) : (
        <ReportContent report={reportQuery.data} />
      )}
    </main>
  );
}

export { ReportsScreen };
