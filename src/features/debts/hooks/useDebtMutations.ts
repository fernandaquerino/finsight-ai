"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { DebtKind } from "@/features/debts/types";

import { debtQueryKeys } from "./queryKeys";

export type CreateDebtPayload = {
  name: string;
  kind: DebtKind;
  totalAmount: number;
  remainingAmount: number;
  monthlyPayment: number | null;
  interestRate: number;
  dueDay: number | null;
};

export type UpdateDebtPayload = Partial<CreateDebtPayload>;

type ApiErrorBody = { error: { code: string; message: string } };

export class DebtRequestError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "DebtRequestError";
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
    throw new DebtRequestError(message, code, response.status);
  }

  const envelope = (await response.json()) as { data: T };
  return envelope.data;
}

function useInvalidateDebts() {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({ queryKey: debtQueryKeys.all });
  };
}

export function useCreateDebt() {
  const invalidate = useInvalidateDebts();

  return useMutation({
    mutationFn: (payload: CreateDebtPayload) =>
      request<{ id: string }>(
        "/api/debts",
        { method: "POST", body: JSON.stringify(payload) },
        "Não foi possível criar a dívida.",
      ),
    onSuccess: invalidate,
  });
}

export function useUpdateDebt() {
  const invalidate = useInvalidateDebts();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDebtPayload }) =>
      request<{ id: string }>(
        `/api/debts/${id}`,
        { method: "PATCH", body: JSON.stringify(payload) },
        "Não foi possível atualizar a dívida.",
      ),
    onSuccess: invalidate,
  });
}

export function useDeleteDebt() {
  const invalidate = useInvalidateDebts();

  return useMutation({
    mutationFn: (id: string) =>
      request<{ id: string; name: string }>(
        `/api/debts/${id}`,
        { method: "DELETE" },
        "Não foi possível excluir a dívida.",
      ),
    onSuccess: invalidate,
  });
}
