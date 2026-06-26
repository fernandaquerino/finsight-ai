"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { transactionQueryKeys } from "./queryKeys";

type ApiErrorBody = { error: { code: string; message: string } };

async function deleteTransaction(id: string) {
  const response = await fetch(`/api/transactions/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    let message = "Não foi possível excluir a transação.";
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

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: transactionQueryKeys.all,
      });
    },
  });
}
