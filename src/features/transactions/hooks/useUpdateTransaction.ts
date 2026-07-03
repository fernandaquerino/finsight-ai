"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { transactionQueryKeys } from "./queryKeys";

export type UpdateTransactionPayload = {
  categoryId?: string | null;
  description?: string;
  amount?: number;
  kind?: "income" | "expense" | "transfer";
  accountId?: string;
  occurredAt?: string; // YYYY-MM-DD
  isRecurring?: boolean;
};

type ApiErrorBody = { error: { code: string; message: string } };

async function patchTransaction(
  id: string,
  payload: UpdateTransactionPayload,
) {
  const response = await fetch(`/api/transactions/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = "Não foi possível atualizar a transação.";
    try {
      const body = (await response.json()) as ApiErrorBody;
      message = body.error?.message ?? message;
    } catch {
      // resposta sem JSON — mantém mensagem padrão.
    }
    throw new Error(message);
  }

  return response.json();
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateTransactionPayload;
    }) => patchTransaction(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: transactionQueryKeys.all,
      });
    },
  });
}
