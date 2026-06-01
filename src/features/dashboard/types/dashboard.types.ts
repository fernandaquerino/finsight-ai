// ─── Domain types ────────────────────────────────────────────────────────────

export type LineDataPoint = {
  day: string;
  value: number;
};

export type CategoryData = {
  name: string;
  value: number;
  percentage: number;
  color: string;
};

export type BarDataPoint = {
  month: string;
  receitas: number;
  despesas: number;
};

export type TransactionCategory =
  | "alimentacao"
  | "transporte"
  | "moradia"
  | "lazer"
  | "saude"
  | "salario"
  | "assinatura"
  | "outro";

export type Transaction = {
  id: string;
  name: string;
  source: string;
  date: string;
  amount: number;
  category: TransactionCategory;
};

// ─── Mock fixtures ────────────────────────────────────────────────────────────

export const MOCK_LINE_DATA: LineDataPoint[] = [
  { day: "01", value: 12800 },
  { day: "03", value: 12400 },
  { day: "05", value: 11900 },
  { day: "08", value: 10600 },
  { day: "10", value: 11000 },
  { day: "12", value: 11200 },
  { day: "15", value: 11800 },
  { day: "17", value: 12100 },
  { day: "19", value: 12200 },
  { day: "20", value: 12600 },
  { day: "22", value: 13100 },
  { day: "24", value: 13800 },
  { day: "27", value: 14200 },
  { day: "31", value: 14821 },
];

export const MOCK_CATEGORY_DATA: CategoryData[] = [
  { name: "Moradia",     value: 3120, percentage: 43, color: "#4845C8" },
  { name: "Alimentação", value: 1842, percentage: 25, color: "#20A077" },
  { name: "Transporte",  value: 725,  percentage: 10, color: "#D95B4A" },
  { name: "Lazer",       value: 638,  percentage: 9,  color: "#E88080" },
  { name: "Saúde",       value: 486,  percentage: 7,  color: "#4592D0" },
  { name: "Outros",      value: 419,  percentage: 6,  color: "#94A3B8" },
];

export const MOCK_BAR_DATA: BarDataPoint[] = [
  { month: "Dez", receitas: 9800,  despesas: 6400 },
  { month: "Jan", receitas: 10200, despesas: 7100 },
  { month: "Fev", receitas: 9600,  despesas: 6800 },
  { month: "Mar", receitas: 10800, despesas: 7400 },
  { month: "Abr", receitas: 11200, despesas: 6900 },
  { month: "Mai", receitas: 10290, despesas: 7103 },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    name: "Padaria São Jorge",
    source: "Extrato",
    date: "31 mai",
    amount: -28.5,
    category: "alimentacao",
  },
  {
    id: "2",
    name: "Uber · Centro → Casa",
    source: "Extrato",
    date: "31 mai",
    amount: -19.9,
    category: "transporte",
  },
  {
    id: "3",
    name: "Spotify Premium",
    source: "Extrato",
    date: "31 mai",
    amount: -21.9,
    category: "assinatura",
  },
  {
    id: "4",
    name: "Supermercado Pão de Açúcar",
    source: "Extrato",
    date: "30 mai",
    amount: -312.74,
    category: "alimentacao",
  },
  {
    id: "5",
    name: "Salário — Acme Tecnologia",
    source: "Extrato",
    date: "30 mai",
    amount: 8400.0,
    category: "salario",
  },
];
