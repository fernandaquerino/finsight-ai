"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { CategoryKey } from "@/lib/categories";
import type { CategoryKind } from "@/features/categories/types";
import { transactionQueryKeys } from "@/features/transactions/hooks/queryKeys";

import { categoryQueryKeys } from "./queryKeys";

export type CreateCategoryPayload = {
  name: string;
  color: string;
  icon: CategoryKey;
  kind: CategoryKind;
  monthlyBudget?: number | null;
};

export type UpdateCategoryPayload = Partial<
  Omit<CreateCategoryPayload, "kind">
>;

export type DeleteCategoryResult = {
  id: string;
  movedCount: number;
  movedTo: { id: string; name: string };
};

type ApiErrorBody = { error: { code: string; message: string } };

export class CategoryRequestError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "CategoryRequestError";
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
    throw new CategoryRequestError(message, code, response.status);
  }

  const envelope = (await response.json()) as { data: T };
  return envelope.data;
}

// Categorias aparecem em selects, filtros e na lista de transações (nome/cor):
// toda mutação invalida os dois domínios.
function useInvalidateCategories() {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all });
    void queryClient.invalidateQueries({
      queryKey: transactionQueryKeys.all,
    });
  };
}

export function useCreateCategory() {
  const invalidate = useInvalidateCategories();

  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) =>
      request<{ id: string }>(
        "/api/categories",
        { method: "POST", body: JSON.stringify(payload) },
        "Não foi possível criar a categoria.",
      ),
    onSuccess: invalidate,
  });
}

export function useUpdateCategory() {
  const invalidate = useInvalidateCategories();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateCategoryPayload;
    }) =>
      request<{ id: string }>(
        `/api/categories/${id}`,
        { method: "PATCH", body: JSON.stringify(payload) },
        "Não foi possível atualizar a categoria.",
      ),
    onSuccess: invalidate,
  });
}

export type CategoryBudgetPayload = {
  id: string;
  monthlyBudget: number | null;
};

// Edição em lote dos limites. O servidor grava tudo numa transação: ou todos
// os limites mudam, ou nenhum.
export function useUpdateCategoryBudgets() {
  const invalidate = useInvalidateCategories();

  return useMutation({
    mutationFn: (budgets: readonly CategoryBudgetPayload[]) =>
      request<{ updated: number }>(
        "/api/categories/budgets",
        { method: "PATCH", body: JSON.stringify({ budgets }) },
        "Não foi possível atualizar os limites.",
      ),
    onSuccess: invalidate,
  });
}

export function useDeleteCategory() {
  const invalidate = useInvalidateCategories();

  return useMutation({
    mutationFn: (id: string) =>
      request<DeleteCategoryResult>(
        `/api/categories/${id}`,
        { method: "DELETE" },
        "Não foi possível excluir a categoria.",
      ),
    onSuccess: invalidate,
  });
}
