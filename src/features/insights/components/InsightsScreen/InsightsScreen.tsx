"use client";

import { useState } from "react";

import { AIInsightBanner } from "@/components/app/AIInsightBanner";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { InsightCard } from "@/features/insights/components/InsightCard";
import { InsightDetailDialog } from "@/features/insights/components/InsightDetailDialog";
import { useInsights } from "@/features/insights/hooks/useInsights";
import type {
  Insight,
  InsightCounts,
  InsightSeverity,
  InsightsSummary,
} from "@/features/insights/types";
import { formatMoney } from "@/lib/money";

// "all" é o filtro padrão; os outros valores são as severidades.
type SeverityFilter = InsightSeverity | "all";

const severityFilters = [
  { value: "all", label: "Todos" },
  { value: "risk", label: "Riscos" },
  { value: "opportunity", label: "Oportunidades" },
  { value: "attention", label: "Atenção" },
  { value: "info", label: "Informativos" },
] as const satisfies readonly { value: SeverityFilter; label: string }[];

type InsightsScreenProps = Readonly<{
  initialSeverity: SeverityFilter;
}>;

function isSeverityFilter(value: string): value is SeverityFilter {
  return severityFilters.some((filter) => filter.value === value);
}

// "2 oportunidades, 2 pontos de atenção e 1 risco" — descreve a composição sem
// inventar nada além da contagem.
function describeCounts(counts: InsightCounts): string {
  const parts = [
    counts.risk === 1
      ? "1 risco"
      : counts.risk > 1
        ? `${counts.risk} riscos`
        : null,
    counts.opportunity === 1
      ? "1 oportunidade"
      : counts.opportunity > 1
        ? `${counts.opportunity} oportunidades`
        : null,
    counts.attention === 1
      ? "1 ponto de atenção"
      : counts.attention > 1
        ? `${counts.attention} pontos de atenção`
        : null,
    counts.info === 1
      ? "1 informativo"
      : counts.info > 1
        ? `${counts.info} informativos`
        : null,
  ].filter((part): part is string => part !== null);

  if (parts.length === 0) return "Nada exige sua atenção neste mês.";
  if (parts.length === 1) return `${parts[0]} para revisar.`;

  return `${parts.slice(0, -1).join(", ")} e ${parts.at(-1)} para revisar.`;
}

function InsightsLoading() {
  return (
    <div
      className="flex flex-col gap-4"
      aria-busy="true"
      aria-label="Carregando insights"
    >
      <Skeleton className="h-[108px] rounded-lg" />
      <Skeleton className="h-9 w-full max-w-md rounded-md" />
      <div className="grid gap-3.5 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-[212px] rounded-lg" />
        ))}
      </div>
    </div>
  );
}

function InsightsHeadline({ summary }: Readonly<{ summary: InsightsSummary }>) {
  const { counts, totals } = summary;
  const title = `${counts.all} ${
    counts.all === 1 ? "observação" : "observações"
  } sobre o seu mês`;

  // A métrica só aparece quando existe economia recorrente de fato. Anualizar um
  // excesso pontual seria prometer uma economia que o dado não sustenta.
  const metric =
    totals.potentialAnnualSavings > 0
      ? {
          label: "Economia potencial",
          value: `${formatMoney(totals.potentialAnnualSavings)}/ano`,
        }
      : undefined;

  return (
    <AIInsightBanner
      label="RESUMO DA IA"
      title={title}
      description={describeCounts(counts)}
      metric={metric}
      source="Derivado das suas transações, orçamentos e metas — sem estimativa de terceiros"
    />
  );
}

function InsightsScreen({ initialSeverity }: InsightsScreenProps) {
  const [severity, setSeverity] = useState<SeverityFilter>(initialSeverity);
  const [detail, setDetail] = useState<Insight | null>(null);

  const insightsQuery = useInsights();

  function handleSeverityChange(value: string) {
    if (!isSeverityFilter(value)) return;

    setSeverity(value);
    // Deep-link do filtro sem navegação — mesmo padrão dos outros filtros.
    window.history.replaceState(
      null,
      "",
      value === "all" ? "/insights" : `/insights?severity=${value}`,
    );
  }

  const summary = insightsQuery.data;
  const visibleInsights =
    summary === undefined
      ? []
      : severity === "all"
        ? summary.items
        : summary.items.filter((insight) => insight.severity === severity);

  return (
    <main className="mx-auto flex w-full max-w-[1240px] flex-col gap-5 p-5 sm:p-6">
      {insightsQuery.isPending ? (
        <InsightsLoading />
      ) : insightsQuery.isError ? (
        <ErrorState
          title="Não foi possível carregar os insights"
          description="Tente novamente em instantes."
          onRetry={() => void insightsQuery.refetch()}
        />
      ) : insightsQuery.data.items.length === 0 ? (
        <EmptyState
          variant="insights"
          title="Nada exige sua atenção este mês"
          description="Assim que houver histórico suficiente, eu aponto cobranças recorrentes, gastos fora do padrão e possíveis lançamentos duplicados."
          primaryAction={{ label: "Ver transações", href: "/transacoes" }}
        />
      ) : (
        <>
          <InsightsHeadline summary={insightsQuery.data} />

          <Tabs value={severity} onValueChange={handleSeverityChange}>
            <TabsList aria-label="Filtrar insights por severidade">
              {severityFilters.map((filter) => {
                const count = insightsQuery.data.counts[filter.value];

                return (
                  <TabsTrigger
                    key={filter.value}
                    value={filter.value}
                    disabled={count === 0}
                  >
                    {filter.label}
                    <span className="ml-1.5 font-mono tabular-nums">
                      {count}
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>

          {visibleInsights.length === 0 ? (
            <EmptyState
              variant="insights"
              title="Nenhum insight nesse filtro"
              description="Volte para “Todos” para ver as demais observações do mês."
            />
          ) : (
            <ul className="grid gap-3.5 lg:grid-cols-2">
              {visibleInsights.map((insight) => (
                <li key={insight.id} className="flex">
                  <InsightCard
                    insight={insight}
                    onOpenDetail={setDetail}
                    className="w-full"
                  />
                </li>
              ))}
            </ul>
          )}

          <p className="sr-only" aria-live="polite">
            {`${visibleInsights.length} de ${insightsQuery.data.counts.all} insights exibidos. ${describeCounts(
              insightsQuery.data.counts,
            )}`}
          </p>
        </>
      )}

      <InsightDetailDialog
        insight={detail}
        onOpenChange={(open) => {
          if (!open) setDetail(null);
        }}
      />
    </main>
  );
}

export { InsightsScreen, describeCounts };
export type { InsightsScreenProps, SeverityFilter };
