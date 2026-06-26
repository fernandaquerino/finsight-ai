// Query keys nomeadas para o domínio de transações. Centralizadas para
// invalidação consistente após mutações.
export const transactionQueryKeys = {
  all: ["transactions"] as const,
  list: (filters?: unknown) =>
    filters === undefined
      ? (["transactions", "list"] as const)
      : (["transactions", "list", filters] as const),
  accounts: ["accounts"] as const,
  categories: ["categories"] as const,
};
