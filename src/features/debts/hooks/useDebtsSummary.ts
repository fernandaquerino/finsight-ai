"use client";

import { useQuery } from "@tanstack/react-query";

import type { DebtStrategy, DebtsSummary } from "@/features/debts/types";

import { debtQueryKeys } from "./queryKeys";

type ApiEnvelope<T> = { data: T };

async function fetchDebtsSummary(
  strategy: DebtStrategy,
  extraMonthly: number,
): Promise<DebtsSummary> {
  const query = new URLSearchParams({
    strategy,
    extraMonthly: String(extraMonthly),
  });
  const response = await fetch(`/api/debts?${query}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Falha ao carregar dívidas (${response.status})`);
  }

  const envelope = (await response.json()) as ApiEnvelope<DebtsSummary>;
  return envelope.data;
}

export function useDebtsSummary(strategy: DebtStrategy, extraMonthly: number) {
  return useQuery({
    queryKey: debtQueryKeys.summary(strategy, extraMonthly),
    queryFn: () => fetchDebtsSummary(strategy, extraMonthly),
    // Trocar de estratégia recalcula no servidor: manter o resultado anterior
    // visível evita o skeleton piscando a cada clique no chip.
    placeholderData: (previous) => previous,
  });
}
