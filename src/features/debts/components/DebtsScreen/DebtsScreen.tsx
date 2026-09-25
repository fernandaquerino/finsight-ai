"use client";

import { useMemo, useState } from "react";
import {
  CalendarIcon,
  CreditCardIcon,
  PlusIcon,
  TrendingUpIcon,
  ZapIcon,
} from "lucide-react";

import { MetricCard } from "@/components/app/MetricCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { DebtCard } from "@/features/debts/components/DebtCard";
import { DebtFormDialog } from "@/features/debts/components/DebtFormDialog";
import { DebtStrategyPanel } from "@/features/debts/components/DebtStrategyPanel";
import { DeleteDebtDialog } from "@/features/debts/components/DeleteDebtDialog";
import { useDebtsSummary } from "@/features/debts/hooks/useDebtsSummary";
import type {
  DebtStrategy,
  DebtSummaryItem,
  DebtsSummary,
} from "@/features/debts/types";
import { formatMoney } from "@/lib/money";
import { parseMoney } from "@/lib/money/money";

type FormState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; debt: DebtSummaryItem };

type DebtsScreenProps = Readonly<{
  initialStrategy: DebtStrategy;
}>;

function DebtsLoading() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Carregando dívidas">
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-[116px] rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-[220px] rounded-lg" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-[104px] rounded-lg" />
        ))}
      </div>
    </div>
  );
}

function DebtsMetrics({ summary }: Readonly<{ summary: DebtsSummary }>) {
  const { totals, focusDebtName } = summary;

  return (
    <section
      aria-label="Resumo das suas dívidas"
      className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4"
    >
      <MetricCard
        label="Total em aberto"
        value={formatMoney(totals.remaining)}
        icon={CreditCardIcon}
        caption={`${totals.debtCount} ${totals.debtCount === 1 ? "dívida" : "dívidas"}`}
      />
      <MetricCard
        label="Parcelas no mês"
        value={formatMoney(totals.monthlyPayment)}
        icon={CalendarIcon}
      />
      <MetricCard
        label="Juros estimados"
        value={formatMoney(totals.monthlyInterest)}
        icon={TrendingUpIcon}
        caption="no próximo mês"
      />
      <MetricCard
        label="Prioridade"
        value={focusDebtName ?? "—"}
        icon={ZapIcon}
        variant="ai"
        trend={summary.strategy === "avalanche" ? "maior juro" : "menor saldo"}
        trendUp
      />
    </section>
  );
}

function DebtsScreen({ initialStrategy }: DebtsScreenProps) {
  const [strategy, setStrategy] = useState<DebtStrategy>(initialStrategy);
  const [extraMonthlyInput, setExtraMonthlyInput] = useState("");
  const [formState, setFormState] = useState<FormState>({ mode: "closed" });
  const [deleteTarget, setDeleteTarget] = useState<DebtSummaryItem | null>(
    null,
  );

  // O aporte extra entra na query key: normalizar aqui evita refetch a cada
  // tecla digitada que não mude o número (ex.: "300," → 300).
  const extraMonthly = useMemo(
    () => (extraMonthlyInput.trim() === "" ? 0 : parseMoney(extraMonthlyInput)),
    [extraMonthlyInput],
  );

  const summaryQuery = useDebtsSummary(strategy, extraMonthly);

  function handleStrategyChange(value: string) {
    const next = value as DebtStrategy;
    setStrategy(next);
    // Deep-link da estratégia sem navegação (mesmo padrão dos outros filtros).
    window.history.replaceState(null, "", `?strategy=${next}`);
  }

  const openCreate = () => setFormState({ mode: "create" });

  return (
    <main className="mx-auto flex w-full max-w-[1240px] flex-col gap-5 p-5 sm:p-6">
      {summaryQuery.isPending ? (
        <DebtsLoading />
      ) : summaryQuery.isError ? (
        <ErrorState
          title="Não foi possível carregar as dívidas"
          description="Tente novamente em instantes."
          onRetry={() => void summaryQuery.refetch()}
        />
      ) : summaryQuery.data.items.length === 0 ? (
        <EmptyState
          icon={CreditCardIcon}
          title="Você ainda não cadastrou dívidas"
          description="Informe saldo, parcela e taxa de juros de cada dívida e eu monto a ordem de quitação que custa menos juros."
          primaryAction={{ label: "Adicionar dívida", onClick: openCreate }}
        />
      ) : (
        <>
          <DebtsMetrics summary={summaryQuery.data} />

          <DebtStrategyPanel
            summary={summaryQuery.data}
            extraMonthlyInput={extraMonthlyInput}
            onExtraMonthlyChange={setExtraMonthlyInput}
          />

          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-base font-medium text-foreground">
                Suas dívidas
              </h2>
              <p className="mt-px text-xs text-muted-foreground">
                Ordenadas pela estratégia escolhida
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Tabs value={strategy} onValueChange={handleStrategyChange}>
                <TabsList aria-label="Estratégia de quitação">
                  <TabsTrigger value="avalanche">Avalanche</TabsTrigger>
                  <TabsTrigger value="snowball">Bola de neve</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button size="sm" onClick={openCreate}>
                <PlusIcon aria-hidden="true" />
                Nova dívida
              </Button>
            </div>
          </div>

          <ul className="flex flex-col gap-3">
            {summaryQuery.data.items.map((debt) => (
              <li key={debt.id}>
                <DebtCard
                  debt={debt}
                  onEdit={(item) => setFormState({ mode: "edit", debt: item })}
                  onDelete={setDeleteTarget}
                />
              </li>
            ))}
          </ul>

          <p className="sr-only" aria-live="polite">
            {`${summaryQuery.data.totals.debtCount} dívidas em aberto, ${formatMoney(
              summaryQuery.data.totals.remaining,
            )} no total. Prioridade: ${summaryQuery.data.focusDebtName ?? "nenhuma"}.`}
          </p>
        </>
      )}

      <DebtFormDialog
        open={formState.mode !== "closed"}
        onOpenChange={(open) => {
          if (!open) setFormState({ mode: "closed" });
        }}
        debt={formState.mode === "edit" ? formState.debt : undefined}
      />
      <DeleteDebtDialog
        debt={deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      />
    </main>
  );
}

export { DebtsScreen };
