"use client";

import { useQuery } from "@tanstack/react-query";

import type {
  ReportGranularity,
  ReportSummary,
} from "@/features/reports/types";

import { reportQueryKeys } from "./queryKeys";

type ApiEnvelope<T> = { data: T };

async function fetchReport(
  granularity: ReportGranularity,
  month: string,
): Promise<ReportSummary> {
  const query = new URLSearchParams({ granularity, month });
  const response = await fetch(`/api/reports?${query}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Falha ao carregar o relatório (${response.status})`);
  }

  const envelope = (await response.json()) as ApiEnvelope<ReportSummary>;
  return envelope.data;
}

export function useReport(granularity: ReportGranularity, month: string) {
  return useQuery({
    queryKey: reportQueryKeys.summary(granularity, month),
    queryFn: () => fetchReport(granularity, month),
    // Trocar mensal → trimestral mantém o relatório anterior na tela enquanto o
    // novo carrega, em vez de voltar ao skeleton.
    placeholderData: (previous) => previous,
  });
}
