"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  type LucideIcon,
  WalletIcon,
} from "lucide-react";

import { MoneyText } from "@/components/app/MoneyText";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  DataFilterBar,
  type TransactionFilters,
} from "@/features/transactions/components/DataFilterBar";
import { TransactionDetailPanel } from "@/features/transactions/components/TransactionDetailPanel";
import { TransactionList } from "@/features/transactions/components/TransactionList";
import type {
  TransactionListItem,
  TransactionsResponse,
} from "@/features/transactions/types";
import { appRoutes } from "@/lib/app-routes";
import { cn } from "@/lib/utils";

type ApiEnvelope<T> = {
  data: T;
};

type SummaryMetric = {
  label: string;
  value: number;
  icon: LucideIcon;
  className: string;
  showSign?: boolean;
  tone?: "positive" | "negative" | "neutral";
};

const TRANSACTIONS_LIMIT = 40;
const filterKeys = [
  "search",
  "from",
  "to",
  "kind",
  "origin",
  "categoryId",
  "accountId",
] as const satisfies readonly (keyof TransactionFilters)[];

function readFiltersFromUrl(): TransactionFilters {
  if (typeof window === "undefined") {
    return {};
  }

  const params = new URLSearchParams(window.location.search);

  return {
    search: params.get("search") ?? undefined,
    from: params.get("from") ?? undefined,
    to: params.get("to") ?? undefined,
    kind: (params.get("kind") as TransactionFilters["kind"]) ?? undefined,
    origin:
      (params.get("origin") as TransactionFilters["origin"]) ?? undefined,
    categoryId: params.get("categoryId") ?? undefined,
    accountId: params.get("accountId") ?? undefined,
  };
}

function buildTransactionsQuery(filters: TransactionFilters): string {
  const params = new URLSearchParams({
    page: "1",
    limit: String(TRANSACTIONS_LIMIT),
  });

  for (const key of filterKeys) {
    const value = filters[key];
    if (value) {
      params.set(key, value);
    }
  }

  return params.toString();
}

function syncFiltersToUrl(filters: TransactionFilters) {
  const params = new URLSearchParams();

  for (const key of filterKeys) {
    const value = filters[key];
    if (value) {
      params.set(key, value);
    }
  }

  const query = params.toString();
  const nextUrl = query ? `/transacoes?${query}` : "/transacoes";
  window.history.replaceState(null, "", nextUrl);
}

function getSignedAmount(transaction: TransactionListItem): number {
  const amount = Number(transaction.amount);

  if (transaction.kind === "expense") {
    return -Math.abs(amount);
  }

  if (transaction.kind === "income") {
    return Math.abs(amount);
  }

  return amount;
}

function buildSummary(items: TransactionListItem[]): SummaryMetric[] {
  const income = items
    .filter((item) => item.kind === "income")
    .reduce((total, item) => total + Math.abs(Number(item.amount)), 0);
  const expenses = items
    .filter((item) => item.kind === "expense")
    .reduce((total, item) => total + Math.abs(Number(item.amount)), 0);
  const result = items.reduce(
    (total, item) => total + getSignedAmount(item),
    0,
  );

  return [
    {
      label: "Entradas",
      value: income,
      icon: ArrowUpRightIcon,
      className: "bg-success-soft text-success",
      tone: "neutral",
    },
    {
      label: "Saídas",
      value: expenses,
      icon: ArrowDownRightIcon,
      className: "bg-danger-soft text-danger",
      tone: "neutral",
    },
    {
      label: "Resultado",
      value: result,
      icon: WalletIcon,
      className: "bg-primary-soft text-primary",
      showSign: true,
      tone: result > 0 ? "positive" : "neutral",
    },
  ];
}

function TransactionsLoading() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Carregando tela">
      <div className="grid gap-3 sm:grid-cols-3 lg:w-[684px]">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-[88px] rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-[420px] rounded-lg" />
    </div>
  );
}

function SummaryCards({ items }: { items: TransactionListItem[] }) {
  const metrics = buildSummary(items);

  return (
    <section
      aria-label="Resumo financeiro das transações"
      className="grid w-full gap-3 sm:grid-cols-3 lg:w-auto lg:grid-cols-[repeat(3,220px)]"
    >
      {metrics.map((metric) => {
        const Icon = metric.icon;

        return (
          <div
            key={metric.label}
            className="flex h-[88px] items-center gap-3 rounded-lg border border-border bg-card px-4 shadow-card"
          >
            <div
              className={cn(
                "flex size-11 items-center justify-center rounded-lg",
                metric.className,
              )}
              aria-hidden="true"
            >
              <Icon className="size-[18px]" />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                {metric.label}
              </p>
              <MoneyText
                value={metric.value}
                showSign={metric.showSign}
                tone={metric.tone}
                className="text-[1.35rem] leading-tight font-bold"
              />
            </div>
          </div>
        );
      })}
    </section>
  );
}

function TransactionsScreen() {
  const [data, setData] = useState<TransactionsResponse | null>(null);
  const [filters, setFilters] = useState<TransactionFilters>(() =>
    readFiltersFromUrl(),
  );
  const [status, setStatus] = useState<"loading" | "error" | "success">(
    "loading",
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);

  async function loadTransactions(
    nextFilters: TransactionFilters,
    signal?: AbortSignal,
  ) {
    try {
      const response = await fetch(
        `/api/transactions?${buildTransactionsQuery(nextFilters)}`,
        {
          signal,
          headers: { Accept: "application/json" },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to load transactions");
      }

      const envelope =
        (await response.json()) as ApiEnvelope<TransactionsResponse>;
      setData(envelope.data);
      setStatus("success");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      setStatus("error");
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    queueMicrotask(() => {
      void loadTransactions(filters, controller.signal);
    });

    return () => controller.abort();
  }, [filters]);

  const handleFiltersChange = useCallback((nextFilters: TransactionFilters) => {
    setFilters(nextFilters);
    syncFiltersToUrl(nextFilters);
    setStatus("loading");
  }, []);

  const items = useMemo(() => data?.items ?? [], [data]);
  const selectedTransaction = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  );
  const hasActiveFilters = filterKeys.some((key) => Boolean(filters[key]));
  const categoryOptions = useMemo(() => {
    const options = new Map<
      string,
      { value: string; label: string; color: string | null }
    >();

    for (const item of items) {
      if (item.category) {
        options.set(item.category.id, {
          value: item.category.id,
          label: item.category.name,
          color: item.category.color,
        });
      }
    }

    return Array.from(options.values());
  }, [items]);
  const accountOptions = useMemo(() => {
    const options = new Map<string, { value: string; label: string }>();

    for (const item of items) {
      options.set(item.account.id, {
        value: item.account.id,
        label: item.account.name ?? "Conta",
      });
    }

    return Array.from(options.values());
  }, [items]);
  const resultDescription = useMemo(() => {
    if (!data) {
      return "Carregando";
    }

    return `Mostrando ${items.length} de ${data.total}`;
  }, [data, items.length]);

  return (
    <main
      className={cn(
        "mx-auto flex w-full max-w-[1240px] flex-col gap-5 p-5 sm:p-6",
        // Reserva a coluna do painel fixo (380px) à direita quando há seleção.
        selectedTransaction && "lg:pr-[404px]",
      )}
    >
      {status === "loading" ? (
        <TransactionsLoading />
      ) : status === "error" ? (
        <ErrorState
          title="Não foi possível carregar as transações"
          description="Tente novamente em instantes."
          onRetry={() => {
            setStatus("loading");
            void loadTransactions(filters);
          }}
        />
      ) : (
        <>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <SummaryCards items={items} />
            <p className="font-mono text-sm tracking-[0.08em] text-muted-foreground xl:pt-8">
              {resultDescription}
            </p>
          </div>
          <DataFilterBar
            filters={filters}
            categoryOptions={categoryOptions}
            accountOptions={accountOptions}
            onFiltersChange={handleFiltersChange}
          />
          {items.length === 0 ? (
            <EmptyState
              variant="transactions"
              title={
                hasActiveFilters
                  ? "Nenhum resultado encontrado"
                  : "Nenhuma transação cadastrada"
              }
              description={
                hasActiveFilters
                  ? "Remova filtros ou tente uma busca diferente."
                  : "Adicione sua primeira movimentação manualmente ou importe um extrato."
              }
              primaryAction={
                hasActiveFilters
                  ? undefined
                  : {
                      label: "Lançamento manual",
                      href: appRoutes.manualEntry,
                    }
              }
            />
          ) : (
            <TransactionList
              transactions={items}
              onSelect={setSelectedId}
              selectedId={selectedId ?? undefined}
            />
          )}
        </>
      )}

      {selectedTransaction ? (
        <TransactionDetailPanel
          key={selectedTransaction.id}
          transaction={selectedTransaction}
          onClose={() => setSelectedId(null)}
          onChanged={() => {
            void loadTransactions(filters);
          }}
        />
      ) : null}
    </main>
  );
}

export { TransactionsScreen, buildSummary };
