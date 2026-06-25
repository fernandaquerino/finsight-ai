"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  CirclePlusIcon,
  type LucideIcon,
  WalletIcon,
} from "lucide-react";

import { MoneyText } from "@/components/app/MoneyText";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
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
};

const TRANSACTIONS_LIMIT = 40;

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
    },
    {
      label: "Saídas",
      value: -expenses,
      icon: ArrowDownRightIcon,
      className: "bg-danger-soft text-danger",
    },
    {
      label: "Resultado",
      value: result,
      icon: WalletIcon,
      className: "bg-primary-soft text-primary",
    },
  ];
}

function TransactionsLoading() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Carregando tela">
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-lg" />
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
      className="grid gap-3 sm:grid-cols-3"
    >
      {metrics.map((metric) => {
        const Icon = metric.icon;

        return (
          <div
            key={metric.label}
            className="flex items-center gap-3 rounded-lg border border-border bg-card p-4"
          >
            <div
              className={cn(
                "flex size-10 items-center justify-center rounded-lg",
                metric.className,
              )}
              aria-hidden="true"
            >
              <Icon className="size-4" />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                {metric.label}
              </p>
              <MoneyText
                value={metric.value}
                showSign={metric.label === "Resultado"}
                tone={metric.value > 0 ? "positive" : "neutral"}
                className="text-xl font-bold"
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
  const [status, setStatus] = useState<"loading" | "error" | "success">(
    "loading",
  );

  async function loadTransactions(signal?: AbortSignal) {
    try {
      const response = await fetch(
        `/api/transactions?limit=${TRANSACTIONS_LIMIT}`,
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
      void loadTransactions(controller.signal);
    });

    return () => controller.abort();
  }, []);

  const items = data?.items ?? [];
  const titleDescription = useMemo(() => {
    if (!data) {
      return "Carregando suas movimentações.";
    }

    return `Mostrando ${items.length} de ${data.total} transações.`;
  }, [data, items.length]);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-5 sm:p-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Transações</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {titleDescription}
          </p>
        </div>
        <Button asChild size="sm">
          <Link href={appRoutes.manualEntry}>
            <CirclePlusIcon />
            Nova transação
          </Link>
        </Button>
      </header>

      {status === "loading" ? (
        <TransactionsLoading />
      ) : status === "error" ? (
        <ErrorState
          title="Não foi possível carregar as transações"
          description="Tente novamente em instantes."
          onRetry={() => {
            setStatus("loading");
            void loadTransactions();
          }}
        />
      ) : items.length === 0 ? (
        <EmptyState
          variant="transactions"
          title="Nenhuma transação cadastrada"
          description="Adicione sua primeira movimentação manualmente ou importe um extrato."
          primaryAction={{
            label: "Nova transação",
            href: appRoutes.manualEntry,
          }}
        />
      ) : (
        <>
          <SummaryCards items={items} />
          <TransactionList transactions={items} />
        </>
      )}
    </main>
  );
}

export { TransactionsScreen, buildSummary };
