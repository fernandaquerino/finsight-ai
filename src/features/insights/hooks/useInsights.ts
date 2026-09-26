"use client";

import { useQuery } from "@tanstack/react-query";

import type { InsightsSummary } from "@/features/insights/types";

import { insightQueryKeys } from "./queryKeys";

type ApiEnvelope<T> = { data: T };

async function fetchInsights(month?: string): Promise<InsightsSummary> {
  const query = month ? `?month=${month}` : "";
  const response = await fetch(`/api/insights${query}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Falha ao carregar insights (${response.status})`);
  }

  const envelope = (await response.json()) as ApiEnvelope<InsightsSummary>;
  return envelope.data;
}

export function useInsights(month?: string) {
  return useQuery({
    queryKey: insightQueryKeys.summary(month),
    queryFn: () => fetchInsights(month),
  });
}
