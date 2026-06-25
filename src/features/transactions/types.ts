export type TransactionKind = "income" | "expense" | "transfer";

export type TransactionListItem = {
  id: string;
  description: string | null;
  amount: string;
  currency: string;
  kind: TransactionKind;
  occurredAt: string;
  origin: "manual" | "import" | "recurring" | "integration";
  category: {
    id: string;
    name: string;
    color: string;
  } | null;
  account: {
    id: string;
    name: string | null;
  };
};

export type TransactionsResponse = {
  items: TransactionListItem[];
  total: number;
  page: number;
  hasNext: boolean;
};
