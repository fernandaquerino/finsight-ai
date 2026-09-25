"use client";

import { useMemo, useState } from "react";
import { PencilIcon, PlusIcon, TagIcon } from "lucide-react";

import { MoneyText } from "@/components/app/MoneyText";
import { MonthYearPicker } from "@/components/app/MonthYearPicker";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { BudgetLimitsDialog } from "@/features/categories/components/BudgetLimitsDialog";
import {
  CategoryBudgetBars,
  type CategoryBudgetBarItem,
} from "@/features/categories/components/CategoryBudgetBars";
import { CategoryCard } from "@/features/categories/components/CategoryCard";
import {
  CategorySpendDonut,
  type CategorySpendSlice,
} from "@/features/categories/components/CategorySpendDonut";
import { CategoryFormDialog } from "@/features/categories/components/CategoryFormDialog";
import { DeleteCategoryDialog } from "@/features/categories/components/DeleteCategoryDialog";
import { useCategoriesSummary } from "@/features/categories/hooks/useCategoriesSummary";
import type {
  CategoriesSummary,
  CategoryKind,
  CategorySummaryItem,
} from "@/features/categories/types";
import { categoryMap } from "@/lib/categories";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

type FormState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; category: CategorySummaryItem };

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

function normalizeName(name: string): string {
  return name.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// "Outros" recebe as transações de categorias excluídas — o servidor bloqueia
// a exclusão; aqui só escondemos a ação.
function isFallbackCategory(category: CategorySummaryItem): boolean {
  return (
    normalizeName(category.name) === normalizeName(categoryMap.outros.label)
  );
}

function toBudgetBarItems(
  items: readonly CategorySummaryItem[],
): CategoryBudgetBarItem[] {
  return items
    .filter((item) => item.kind === "expense" && item.monthlyBudget !== null)
    .map((item) => ({
      id: item.id,
      name: item.name,
      color: item.color,
      amount: item.amount,
      budget: item.monthlyBudget ?? 0,
    }))
    .sort((a, b) => b.amount / b.budget - a.amount / a.budget);
}

// Fatias da rosca de composição. Só entram categorias com movimento no mês —
// uma fatia de valor zero não é representável e poluiria a legenda.
function toSpendSlices(
  items: readonly CategorySummaryItem[],
  kind: CategoryKind,
): CategorySpendSlice[] {
  const relevant = items.filter(
    (item) => item.kind === kind && item.amount > 0,
  );
  const total = relevant.reduce((sum, item) => sum + item.amount, 0);
  if (total <= 0) return [];

  return relevant
    .map((item) => ({
      id: item.id,
      name: item.name,
      value: item.amount,
      percentage: Math.round((item.amount / total) * 100),
      color: item.color,
    }))
    .sort((a, b) => b.value - a.value);
}

function CategoriesLoading() {
  return (
    <div
      className="space-y-5"
      aria-busy="true"
      aria-label="Carregando categorias"
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-[72px] rounded-lg" />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <Skeleton className="h-[280px] rounded-lg" />
        <Skeleton className="h-[280px] rounded-lg" />
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-[152px] rounded-lg" />
        ))}
      </div>
    </div>
  );
}

function SummaryStrip({
  summary,
  kind,
}: Readonly<{ summary: CategoriesSummary; kind: CategoryKind }>) {
  const { totals } = summary;
  const usage =
    totals.budget > 0 ? totals.budgetedExpense / totals.budget : null;

  const metrics =
    kind === "expense"
      ? [
          {
            label: "Gasto no mês",
            content: <MoneyText value={totals.expense} tone="neutral" />,
          },
          {
            label: "Orçamento total",
            content: <MoneyText value={totals.budget} tone="neutral" />,
          },
          {
            label: "Uso do orçamento",
            content: (
              <span
                className={cn(
                  "font-mono tabular-nums",
                  usage !== null && usage > 1
                    ? "text-danger"
                    : "text-foreground",
                )}
              >
                {usage === null ? "—" : `${Math.round(usage * 100)}%`}
              </span>
            ),
          },
        ]
      : [
          {
            label: "Recebido no mês",
            content: <MoneyText value={totals.income} tone="neutral" />,
          },
        ];

  return (
    <section
      aria-label="Resumo das categorias no mês"
      className="grid gap-3 sm:grid-cols-3"
    >
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="rounded-lg border border-border bg-card px-4 py-3 shadow-card"
        >
          <p className="text-[10px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
            {metric.label}
          </p>
          <p className="mt-1 text-lg leading-tight font-semibold">
            {metric.content}
          </p>
        </div>
      ))}
    </section>
  );
}

// Espelha o SectionHeader do design: título 16/500, subtítulo 12 muted,
// ação alinhada pela base do bloco de texto.
function PanelHeader({
  id,
  title,
  subtitle,
  action,
}: Readonly<{
  id: string;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}>) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 id={id} className="text-base font-medium text-foreground">
          {title}
        </h2>
        <p className="mt-px text-xs text-muted-foreground">{subtitle}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

function SpendPanel({
  slices,
  total,
  kind,
}: Readonly<{
  slices: readonly CategorySpendSlice[];
  total: number;
  kind: CategoryKind;
}>) {
  const isExpense = kind === "expense";

  return (
    <section
      aria-labelledby="spend-panel-title"
      className="h-fit rounded-lg border border-border bg-card px-5 py-4 shadow-card"
    >
      <PanelHeader
        id="spend-panel-title"
        title={isExpense ? "Composição de gastos" : "Composição das receitas"}
        subtitle={`${formatMoney(total)} no mês`}
      />
      {slices.length > 0 ? (
        <CategorySpendDonut
          slices={slices}
          ariaLabel={
            isExpense
              ? "Gráfico de rosca da composição de gastos por categoria"
              : "Gráfico de rosca da composição de receitas por categoria"
          }
        />
      ) : (
        <div className="rounded-md bg-muted/60 p-4 text-sm text-muted-foreground">
          <p>
            Sem dados ainda. Suas categorias com{" "}
            {isExpense ? "gastos" : "receitas"} no mês aparecem aqui.
          </p>
        </div>
      )}
    </section>
  );
}

function BudgetPanel({
  items,
  onCreate,
  onEditLimits,
  canEditLimits,
}: Readonly<{
  items: CategoryBudgetBarItem[];
  onCreate: () => void;
  onEditLimits: () => void;
  canEditLimits: boolean;
}>) {
  return (
    <section
      aria-labelledby="budget-panel-title"
      className="h-fit rounded-lg border border-border bg-card px-5 py-4 shadow-card"
    >
      <PanelHeader
        id="budget-panel-title"
        title="Orçamento por categoria"
        subtitle="Uso de cada limite definido"
        action={
          canEditLimits ? (
            <Button variant="ghost" size="sm" onClick={onEditLimits}>
              <PencilIcon aria-hidden="true" />
              Editar limites
            </Button>
          ) : undefined
        }
      />
      {items.length > 0 ? (
        <CategoryBudgetBars items={items} />
      ) : (
        <div className="rounded-md bg-muted/60 p-4 text-sm text-muted-foreground">
          <p>
            Defina um orçamento mensal nas categorias de despesa para acompanhar
            quanto já foi usado.
          </p>
          <Button
            variant="link"
            className="mt-1 h-auto px-0"
            onClick={onCreate}
          >
            Criar categoria com orçamento
          </Button>
        </div>
      )}
    </section>
  );
}

function CategoriesScreen({
  initialMonth,
}: Readonly<{ initialMonth: string }>) {
  const [month, setMonth] = useState(initialMonth);
  const [kind, setKind] = useState<CategoryKind>("expense");
  const [formState, setFormState] = useState<FormState>({ mode: "closed" });
  const [deleteTarget, setDeleteTarget] = useState<CategorySummaryItem | null>(
    null,
  );
  const [limitsOpen, setLimitsOpen] = useState(false);
  const summaryQuery = useCategoriesSummary(month);

  const visibleItems = useMemo(
    () => summaryQuery.data?.items.filter((item) => item.kind === kind) ?? [],
    [summaryQuery.data, kind],
  );
  const budgetItems = useMemo(
    () => toBudgetBarItems(summaryQuery.data?.items ?? []),
    [summaryQuery.data],
  );
  const spendSlices = useMemo(
    () => toSpendSlices(summaryQuery.data?.items ?? [], kind),
    [summaryQuery.data, kind],
  );
  // Orçamento só se aplica a despesa — o dialog em lote lista apenas essas.
  const expenseCategories = useMemo(
    () =>
      summaryQuery.data?.items.filter((item) => item.kind === "expense") ?? [],
    [summaryQuery.data],
  );

  function handleMonthChange(date: Date) {
    const nextMonth = dateToMonthKey(date);
    setMonth(nextMonth);
    // Deep-link do mês sem navegação (mesmo padrão dos filtros de transações).
    window.history.replaceState(null, "", `?month=${nextMonth}`);
  }

  const openCreate = () => setFormState({ mode: "create" });

  return (
    <main className="mx-auto flex w-full max-w-[1240px] flex-col gap-5 p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <MonthYearPicker
            value={monthKeyToDate(month)}
            onChange={handleMonthChange}
          />
          <Tabs
            value={kind}
            onValueChange={(value) => setKind(value as CategoryKind)}
          >
            <TabsList aria-label="Tipo de categoria">
              <TabsTrigger value="expense">Despesas</TabsTrigger>
              <TabsTrigger value="income">Receitas</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {summaryQuery.isPending ? (
        <CategoriesLoading />
      ) : summaryQuery.isError ? (
        <ErrorState
          title="Não foi possível carregar as categorias"
          description="Tente novamente em instantes."
          onRetry={() => void summaryQuery.refetch()}
        />
      ) : (
        <>
          <SummaryStrip summary={summaryQuery.data} kind={kind} />

          <div
            className={cn(
              "grid gap-4",
              kind === "expense" &&
                "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]",
            )}
          >
            <SpendPanel
              slices={spendSlices}
              total={
                kind === "expense"
                  ? summaryQuery.data.totals.expense
                  : summaryQuery.data.totals.income
              }
              kind={kind}
            />
            {kind === "expense" ? (
              <BudgetPanel
                items={budgetItems}
                onCreate={openCreate}
                onEditLimits={() => setLimitsOpen(true)}
                canEditLimits={expenseCategories.length > 0}
              />
            ) : null}
          </div>

          {visibleItems.length === 0 ? (
            <EmptyState
              icon={TagIcon}
              title={
                kind === "expense"
                  ? "Nenhuma categoria de despesa"
                  : "Nenhuma categoria de receita"
              }
              description="Crie categorias para organizar seus lançamentos e acompanhar orçamentos."
              primaryAction={{ label: "Nova categoria", onClick: openCreate }}
            />
          ) : (
            <section aria-labelledby="all-categories-title">
              <PanelHeader
                id="all-categories-title"
                title="Todas as categorias"
                subtitle="A IA classifica novos lançamentos automaticamente"
                action={
                  <Button variant="secondary" size="sm" onClick={openCreate}>
                    <PlusIcon aria-hidden="true" />
                    Nova categoria
                  </Button>
                }
              />
              <ul className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3">
                {visibleItems.map((category) => (
                  <li key={category.id}>
                    <CategoryCard
                      category={category}
                      canDelete={!isFallbackCategory(category)}
                      onEdit={(item) =>
                        setFormState({ mode: "edit", category: item })
                      }
                      onDelete={setDeleteTarget}
                    />
                  </li>
                ))}
              </ul>
            </section>
          )}

          <p className="sr-only" aria-live="polite">
            {`${visibleItems.length} categorias. Total ${formatMoney(
              kind === "expense"
                ? summaryQuery.data.totals.expense
                : summaryQuery.data.totals.income,
            )}.`}
          </p>
        </>
      )}

      <CategoryFormDialog
        open={formState.mode !== "closed"}
        onOpenChange={(open) => {
          if (!open) setFormState({ mode: "closed" });
        }}
        category={formState.mode === "edit" ? formState.category : undefined}
        defaultKind={kind}
      />
      <BudgetLimitsDialog
        open={limitsOpen}
        onOpenChange={setLimitsOpen}
        categories={expenseCategories}
      />
      <DeleteCategoryDialog
        category={deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      />
    </main>
  );
}

export { CategoriesScreen, toBudgetBarItems, toSpendSlices };
