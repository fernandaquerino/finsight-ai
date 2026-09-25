"use client";

import { useQuery } from "@tanstack/react-query";

import type { CategoriesSummary } from "@/features/categories/types";

import { categoryQueryKeys } from "./queryKeys";

type ApiEnvelope<T> = { data: T };

async function fetchCategoriesSummary(
  month: string,
): Promise<CategoriesSummary> {
  const response = await fetch(
    `/api/categories/summary?${new URLSearchParams({ month })}`,
    { headers: { Accept: "application/json" } },
  );

  if (!response.ok) {
    throw new Error(`Falha ao carregar categorias (${response.status})`);
  }

  const envelope = (await response.json()) as ApiEnvelope<CategoriesSummary>;
  return envelope.data;
}

export function useCategoriesSummary(month: string) {
  return useQuery({
    queryKey: categoryQueryKeys.summary(month),
    queryFn: () => fetchCategoriesSummary(month),
  });
}
