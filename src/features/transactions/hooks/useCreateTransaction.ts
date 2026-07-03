"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { TransactionKind } from "@/features/transactions/types";

import { transactionQueryKeys } from "./queryKeys";

export type CreateTransactionPayload = {
  accountId: string;
  categoryId?: string | null;
  amount: number;
  kind: TransactionKind;
  description: string;
  occurredAt: string; // YYYY-MM-DD
};

type ApiErrorBody = {
  error: { code: string; message: string };
};

export class CreateTransactionError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "CreateTransactionError";
  }
}

async function postTransaction(payload: CreateTransactionPayload) {
  const response = await fetch("/api/transactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let code = "INTERNAL_ERROR";
    let message = "Não foi possível criar a transação.";
    try {
      const body = (await response.json()) as ApiErrorBody;
      code = body.error?.code ?? code;
      message = body.error?.message ?? message;
    } catch {
      // resposta sem corpo JSON — mantém mensagem padrão.
    }
    throw new CreateTransactionError(message, code, response.status);
  }

  return response.json();
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postTransaction,
    onSuccess: () => {
      // Lista de transações e dados derivados ficam desatualizados após criar.
      void queryClient.invalidateQueries({
        queryKey: transactionQueryKeys.all,
      });
    },
  });
}
