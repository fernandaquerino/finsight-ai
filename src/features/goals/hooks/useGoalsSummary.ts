"use client";

import { useQuery } from "@tanstack/react-query";

import type { GoalsSummary } from "@/features/goals/types";

import { goalQueryKeys } from "./queryKeys";

type ApiEnvelope<T> = { data: T };

async function fetchGoalsSummary(): Promise<GoalsSummary> {
  const response = await fetch("/api/goals", {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Falha ao carregar metas (${response.status})`);
  }

  const envelope = (await response.json()) as ApiEnvelope<GoalsSummary>;
  return envelope.data;
}

export function useGoalsSummary() {
  return useQuery({
    queryKey: goalQueryKeys.summary(),
    queryFn: fetchGoalsSummary,
  });
}
