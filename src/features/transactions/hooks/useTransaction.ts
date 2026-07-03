"use client";

import { useQuery } from "@tanstack/react-query";

import type { TransactionKind } from "@/features/transactions/types";

export type TransactionEditData = {
  id: string;
  accountId: string;
  categoryId: string | null;
  amount: string;
  kind: TransactionKind;
  description: string | null;
  occurredAt: string;
  isRecurring: boolean;
};

type ApiEnvelope<T> = { data: T };

async function fetchTransaction(id: string): Promise<TransactionEditData> {
  const response = await fetch(`/api/transactions/${id}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Falha ao carregar a transação (${response.status})`);
  }

  const envelope = (await response.json()) as ApiEnvelope<TransactionEditData>;
  return envelope.data;
}

// Busca uma transação para edição. Desabilitado quando não há id (criação).
export function useTransaction(id: string | undefined) {
  return useQuery({
    queryKey: ["transactions", "detail", id],
    queryFn: () => fetchTransaction(id as string),
    enabled: Boolean(id),
  });
}
