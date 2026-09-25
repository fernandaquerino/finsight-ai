"use client";

import { useMutation } from "@tanstack/react-query";

import { SettingsRequestError } from "./request";

type ApiErrorBody = { error: { code: string; message: string } };

// O export não passa pelo helper `request`: a resposta é um arquivo, não o
// envelope { data }. O download é disparado via blob (e não por um link para a
// rota) porque o endpoint é POST — de propósito, para que uma URL com dados
// pessoais não fique no histórico do navegador.
async function downloadExport(): Promise<{ fileName: string }> {
  const response = await fetch("/api/settings/export", {
    method: "POST",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    let code = "INTERNAL_ERROR";
    let message = "Não foi possível exportar seus dados.";
    try {
      const body = (await response.json()) as ApiErrorBody;
      code = body.error?.code ?? code;
      message = body.error?.message ?? message;
    } catch {
      // resposta sem JSON — mantém mensagem padrão.
    }
    throw new SettingsRequestError(message, code, response.status);
  }

  const fileName =
    parseFileName(response.headers.get("Content-Disposition")) ??
    "finsight-meus-dados.json";
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);

  try {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.append(link);
    link.click();
    link.remove();
  } finally {
    // Sempre revoga: o blob carrega os dados financeiros do usuário e não deve
    // ficar acessível por URL depois do download.
    URL.revokeObjectURL(url);
  }

  return { fileName };
}

function parseFileName(contentDisposition: string | null): string | null {
  if (!contentDisposition) return null;
  const match = /filename="([^"]+)"/.exec(contentDisposition);
  return match?.[1] ?? null;
}

export function useExportUserData() {
  return useMutation({ mutationFn: downloadExport });
}
