"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type {
  ChangePasswordPayload,
  CreateAccountPayload,
  UpdateSettingsPayload,
} from "@/features/settings/types";

import { settingsQueryKeys } from "./queryKeys";
import { request } from "./request";

function useInvalidateSettings() {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({ queryKey: settingsQueryKeys.all });
  };
}

export function useUpdateSettings() {
  const invalidate = useInvalidateSettings();

  return useMutation({
    mutationFn: (payload: UpdateSettingsPayload) =>
      request<{ id: string }>(
        "/api/settings",
        { method: "PATCH", body: JSON.stringify(payload) },
        "Não foi possível salvar a alteração.",
      ),
    onSuccess: invalidate,
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) =>
      request<{ id: string }>(
        "/api/settings/password",
        { method: "POST", body: JSON.stringify(payload) },
        "Não foi possível alterar a senha.",
      ),
  });
}

export function useCreateAccount() {
  const invalidate = useInvalidateSettings();

  return useMutation({
    mutationFn: (payload: CreateAccountPayload) =>
      request<{ id: string; name: string }>(
        "/api/accounts",
        { method: "POST", body: JSON.stringify(payload) },
        "Não foi possível criar a conta.",
      ),
    onSuccess: invalidate,
  });
}

export function useDeleteAccount() {
  const invalidate = useInvalidateSettings();

  return useMutation({
    mutationFn: (id: string) =>
      request<{ id: string; name: string }>(
        `/api/accounts/${id}`,
        { method: "DELETE" },
        "Não foi possível remover a conta.",
      ),
    onSuccess: invalidate,
  });
}

// Exclusão da conta de usuário. Não invalida query nenhuma: depois disso o
// cliente força logout (ver DeleteUserAccountDialog).
export function useDeleteUserAccount() {
  return useMutation({
    mutationFn: (confirmation: string) =>
      request<{ id: string }>(
        "/api/settings/account",
        { method: "DELETE", body: JSON.stringify({ confirmation }) },
        "Não foi possível encerrar a conta.",
      ),
  });
}
