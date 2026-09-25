// Invalidar `all` atualiza a lista de metas e qualquer resumo derivado dela.
export const goalQueryKeys = {
  all: ["goals"] as const,
  summary: () => ["goals", "summary"] as const,
};
