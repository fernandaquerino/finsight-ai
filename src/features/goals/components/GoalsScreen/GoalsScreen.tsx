"use client";

import { useState } from "react";
import {
  CalendarIcon,
  PiggyBankIcon,
  PlusIcon,
  TargetIcon,
  TrendingUpIcon,
} from "lucide-react";

import { MetricCard } from "@/components/app/MetricCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { DeleteGoalDialog } from "@/features/goals/components/DeleteGoalDialog";
import { GoalCard } from "@/features/goals/components/GoalCard";
import { GoalFormDialog } from "@/features/goals/components/GoalFormDialog";
import { useGoalsSummary } from "@/features/goals/hooks/useGoalsSummary";
import type { GoalSummaryItem, GoalsSummary } from "@/features/goals/types";
import { formatMoney } from "@/lib/money";

type FormState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; goal: GoalSummaryItem };

function GoalsLoading() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Carregando metas">
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-[116px] rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(360px,1fr))] gap-3.5">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-[196px] rounded-lg" />
        ))}
      </div>
    </div>
  );
}

function GoalsMetrics({ summary }: Readonly<{ summary: GoalsSummary }>) {
  const { totals } = summary;

  return (
    <section
      aria-label="Resumo das suas metas"
      className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4"
    >
      <MetricCard
        label="Guardado no total"
        value={formatMoney(totals.saved)}
        icon={PiggyBankIcon}
        caption={`de ${formatMoney(totals.target)}`}
      />
      <MetricCard
        label="Metas ativas"
        value={String(totals.goalCount)}
        icon={TargetIcon}
        caption={
          totals.goalCount > 0
            ? `${totals.onTrackCount} no ritmo`
            : "nenhuma meta ainda"
        }
      />
      <MetricCard
        label="Aporte mensal"
        value={formatMoney(totals.monthlyContribution)}
        icon={CalendarIcon}
      />
      <MetricCard
        label="Progresso médio"
        value={
          totals.averageProgress === null
            ? "—"
            : `${Math.round(totals.averageProgress * 100)}%`
        }
        icon={TrendingUpIcon}
        variant="ai"
        caption="do valor total das metas"
      />
    </section>
  );
}

function GoalsScreen() {
  const [formState, setFormState] = useState<FormState>({ mode: "closed" });
  const [deleteTarget, setDeleteTarget] = useState<GoalSummaryItem | null>(
    null,
  );
  const summaryQuery = useGoalsSummary();

  const openCreate = () => setFormState({ mode: "create" });

  return (
    <main className="mx-auto flex w-full max-w-[1240px] flex-col gap-5 p-5 sm:p-6">
      {summaryQuery.isPending ? (
        <GoalsLoading />
      ) : summaryQuery.isError ? (
        <ErrorState
          title="Não foi possível carregar as metas"
          description="Tente novamente em instantes."
          onRetry={() => void summaryQuery.refetch()}
        />
      ) : summaryQuery.data.items.length === 0 ? (
        <EmptyState
          icon={TargetIcon}
          title="Você ainda não tem metas"
          description="Defina um objetivo — reserva de emergência, viagem, um equipamento — e eu projeto quando você chega lá com base no seu aporte mensal."
          primaryAction={{ label: "Criar primeira meta", onClick: openCreate }}
        />
      ) : (
        <>
          <GoalsMetrics summary={summaryQuery.data} />

          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-base font-medium text-foreground">
                Suas metas
              </h2>
              <p className="mt-px text-xs text-muted-foreground">
                Acompanhe o quanto falta para cada objetivo
              </p>
            </div>
            <Button size="sm" onClick={openCreate}>
              <PlusIcon aria-hidden="true" />
              Nova meta
            </Button>
          </div>

          <ul className="grid grid-cols-[repeat(auto-fill,minmax(360px,1fr))] gap-3.5">
            {summaryQuery.data.items.map((goal) => (
              <li key={goal.id}>
                <GoalCard
                  goal={goal}
                  onEdit={(item) => setFormState({ mode: "edit", goal: item })}
                  onDelete={setDeleteTarget}
                />
              </li>
            ))}
          </ul>

          <p className="sr-only" aria-live="polite">
            {`${summaryQuery.data.totals.goalCount} metas. ${formatMoney(
              summaryQuery.data.totals.saved,
            )} guardados de ${formatMoney(summaryQuery.data.totals.target)}.`}
          </p>

          <p className="text-xs text-muted-foreground">
            As projeções são estimativas calculadas a partir do valor guardado,
            do aporte mensal e do prazo que você informou — não são
            aconselhamento financeiro profissional.
          </p>
        </>
      )}

      <GoalFormDialog
        open={formState.mode !== "closed"}
        onOpenChange={(open) => {
          if (!open) setFormState({ mode: "closed" });
        }}
        goal={formState.mode === "edit" ? formState.goal : undefined}
      />
      <DeleteGoalDialog
        goal={deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      />
    </main>
  );
}

export { GoalsScreen };
