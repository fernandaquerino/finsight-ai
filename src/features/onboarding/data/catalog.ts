// Catálogo de dados do onboarding — fonte única, sem dependência de UI (ícones).
// Importado tanto pelo cliente (wizard) quanto pelo servidor (validator/service),
// por isso é mantido server-safe: só dados primitivos.

// --- Moedas suportadas ---------------------------------------------------
export const CURRENCIES = [
  { code: "BRL", label: "BRL — Real brasileiro" },
  { code: "USD", label: "USD — Dólar americano" },
  { code: "EUR", label: "EUR — Euro" },
  { code: "GBP", label: "GBP — Libra esterlina" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];
export const CURRENCY_CODES = CURRENCIES.map((c) => c.code) as [
  CurrencyCode,
  ...CurrencyCode[],
];

// --- Objetivo principal (passo 3) ----------------------------------------
export const GOALS = [
  {
    key: "organize",
    title: "Organizar meus gastos",
    description: "Ver para onde o dinheiro vai",
  },
  {
    key: "save",
    title: "Economizar mais",
    description: "Sobrar mais no fim do mês",
  },
  {
    key: "debts",
    title: "Sair das dívidas",
    description: "Quitar com estratégia",
  },
  {
    key: "subscriptions",
    title: "Acompanhar assinaturas",
    description: "Controlar cobranças recorrentes",
  },
  {
    key: "goals",
    title: "Planejar metas",
    description: "Reserva, viagem, objetivos",
  },
  {
    key: "habits",
    title: "Entender hábitos com IA",
    description: "Insights sobre seus padrões",
  },
] as const;

export type GoalKey = (typeof GOALS)[number]["key"];
export const GOAL_KEYS = GOALS.map((g) => g.key) as [GoalKey, ...GoalKey[]];

// --- Categorias sugeridas (passo 4) --------------------------------------
// O servidor resolve a categoria a partir da `key` (cor/nome/kind vêm daqui,
// nunca do cliente) para impedir inserção arbitrária.
export const SUGGESTED_CATEGORIES = [
  {
    key: "alimentacao",
    name: "Alimentação",
    color: "#F59E0B",
    kind: "expense",
  },
  { key: "moradia", name: "Moradia", color: "#3B82F6", kind: "expense" },
  { key: "transporte", name: "Transporte", color: "#8B5CF6", kind: "expense" },
  {
    key: "assinaturas",
    name: "Assinaturas",
    color: "#EC4899",
    kind: "expense",
  },
  { key: "saude", name: "Saúde", color: "#06B6D4", kind: "expense" },
  { key: "lazer", name: "Lazer", color: "#22C55E", kind: "expense" },
  { key: "compras", name: "Compras", color: "#EF4444", kind: "expense" },
  { key: "educacao", name: "Educação", color: "#14B8A6", kind: "expense" },
  { key: "pets", name: "Pets", color: "#F97316", kind: "expense" },
  { key: "outros", name: "Outros", color: "#94A3B8", kind: "expense" },
] as const;

export type CategoryKey = (typeof SUGGESTED_CATEGORIES)[number]["key"];
export const CATEGORY_KEYS = SUGGESTED_CATEGORIES.map((c) => c.key) as [
  CategoryKey,
  ...CategoryKey[],
];

// Categorias de receita criadas automaticamente no onboarding (não entram no
// picker, que é só de despesas). Garante que lançar uma receita tenha opções.
export const DEFAULT_INCOME_CATEGORIES = [
  { name: "Salário", color: "#16A34A", kind: "income" },
  { name: "Outros", color: "#94A3B8", kind: "income" },
] as const;

// --- Tipos de conta (passo 5) --------------------------------------------
// Espelha o enum account_type do schema.
export const ACCOUNT_TYPES = [
  { value: "checking", label: "Conta corrente" },
  { value: "savings", label: "Poupança" },
  { value: "credit_card", label: "Cartão de crédito" },
  { value: "investment", label: "Investimentos" },
  { value: "other", label: "Outro" },
] as const;

export type AccountTypeValue = (typeof ACCOUNT_TYPES)[number]["value"];
export const ACCOUNT_TYPE_VALUES = ACCOUNT_TYPES.map((t) => t.value) as [
  AccountTypeValue,
  ...AccountTypeValue[],
];

// Sugestões rápidas de conta (passo 5) — prefilam nome + tipo.
export const ACCOUNT_SUGGESTIONS = [
  { key: "nubank", name: "Nubank", type: "checking", color: "#8B5CF6" },
  { key: "itau", name: "Itaú", type: "checking", color: "#F97316" },
  { key: "inter", name: "Inter", type: "checking", color: "#F97316" },
  { key: "carteira", name: "Carteira", type: "other", color: "#94A3B8" },
  {
    key: "cartao",
    name: "Cartão de crédito",
    type: "credit_card",
    color: "#64748B",
  },
] as const satisfies ReadonlyArray<{
  key: string;
  name: string;
  type: AccountTypeValue;
  color: string;
}>;
