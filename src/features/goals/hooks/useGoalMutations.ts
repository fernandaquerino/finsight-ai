"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { GoalIconKey } from "@/features/goals/types";

import { goalQueryKeys } from "./queryKeys";

export type CreateGoalPayload = {
  name: string;
  icon: GoalIconKey;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number | null;
  deadline: string | null;
};

export type UpdateGoalPayload = Partial<CreateGoalPayload>;

type ApiErrorBody = { error: { code: string; message: string } };

export class GoalRequestError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "GoalRequestError";
  }
}

async function request<T>(
  url: string,
  init: RequestInit,
  fallbackMessage: string,
): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", Accept: "application/json" },
  });

  if (!response.ok) {
    let code = "INTERNAL_ERROR";
    let message = fallbackMessage;
    try {
      const body = (await response.json()) as ApiErrorBody;
      code = body.error?.code ?? code;
      message = body.error?.message ?? message;
    } catch {
      // resposta sem JSON — mantém mensagem padrão.
    }
    throw new GoalRequestError(message, code, response.status);
  }

  const envelope = (await response.json()) as { data: T };
  return envelope.data;
}

function useInvalidateGoals() {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({ queryKey: goalQueryKeys.all });
  };
}

export function useCreateGoal() {
  const invalidate = useInvalidateGoals();

  return useMutation({
    mutationFn: (payload: CreateGoalPayload) =>
      request<{ id: string }>(
        "/api/goals",
        { method: "POST", body: JSON.stringify(payload) },
        "Não foi possível criar a meta.",
      ),
    onSuccess: invalidate,
  });
}

export function useUpdateGoal() {
  const invalidate = useInvalidateGoals();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateGoalPayload }) =>
      request<{ id: string }>(
        `/api/goals/${id}`,
        { method: "PATCH", body: JSON.stringify(payload) },
        "Não foi possível atualizar a meta.",
      ),
    onSuccess: invalidate,
  });
}

export function useDeleteGoal() {
  const invalidate = useInvalidateGoals();

  return useMutation({
    mutationFn: (id: string) =>
      request<{ id: string; name: string }>(
        `/api/goals/${id}`,
        { method: "DELETE" },
        "Não foi possível excluir a meta.",
      ),
    onSuccess: invalidate,
  });
}
