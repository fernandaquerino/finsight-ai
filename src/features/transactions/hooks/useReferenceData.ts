"use client";

import { useQuery } from "@tanstack/react-query";

import type { TransactionKind } from "@/features/transactions/types";

import { transactionQueryKeys } from "./queryKeys";

export type AccountOption = {
  id: string;
  name: string;
  type: string;
};

export type CategoryOption = {
  id: string;
  name: string;
  color: string;
  kind: Exclude<TransactionKind, "transfer">;
};

type ApiEnvelope<T> = { data: T };

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Request to ${url} failed with ${response.status}`);
  }

  const envelope = (await response.json()) as ApiEnvelope<T>;
  return envelope.data;
}

export function useAccounts() {
  return useQuery({
    queryKey: transactionQueryKeys.accounts,
    queryFn: () => fetchJson<AccountOption[]>("/api/accounts"),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: transactionQueryKeys.categories,
    queryFn: () => fetchJson<CategoryOption[]>("/api/categories"),
  });
}
