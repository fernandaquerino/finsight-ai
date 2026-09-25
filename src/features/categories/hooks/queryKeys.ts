// Mesmo prefixo usado por transactionQueryKeys.categories (selects e filtros):
// invalidar `all` atualiza a tela de categorias e os selects de transação.
export const categoryQueryKeys = {
  all: ["categories"] as const,
  summary: (month: string) => ["categories", "summary", month] as const,
};
