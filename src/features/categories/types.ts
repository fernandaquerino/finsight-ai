// Contratos da API de categorias. Reexporta os tipos do service (import type:
// não entra no bundle do cliente) para que front e back não divirjam.
export type {
  BudgetStatus,
  CategoriesSummary,
  CategorySummaryItem,
} from "@/server/services/categories/summary";

export type CategoryKind = "income" | "expense";
