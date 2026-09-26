// Invalidar `all` atualiza os insights de qualquer mês. O mês entra na chave
// porque a análise é sempre de um mês específico.
export const insightQueryKeys = {
  all: ["insights"] as const,
  summary: (month?: string) =>
    ["insights", "summary", month ?? "current"] as const,
};
