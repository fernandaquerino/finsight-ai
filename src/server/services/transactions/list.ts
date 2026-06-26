import {
  transactionRepository,
  type Database,
  type TransactionListFilters,
} from "@/server/repositories";
import type { TransactionsQuery } from "@/server/validators/transactions";

type TransactionListRow = Awaited<
  ReturnType<typeof transactionRepository.listFiltered>
>["items"][number];

export type TransactionListItem = {
  id: string;
  description: string | null;
  amount: string;
  currency: string;
  kind: "income" | "expense" | "transfer";
  occurredAt: Date;
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

export type TransactionListResult = {
  items: TransactionListItem[];
  total: number;
  page: number;
  hasNext: boolean;
};

type Deps = {
  repository?: Pick<typeof transactionRepository, "listFiltered">;
};

function parseDateStart(value?: string): Date | undefined {
  if (!value) {
    return undefined;
  }

  return new Date(`${value}T00:00:00.000Z`);
}

function parseDateEndExclusive(value?: string): Date | undefined {
  if (!value) {
    return undefined;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date;
}

function toFilters(query: TransactionsQuery): TransactionListFilters {
  return {
    from: parseDateStart(query.from),
    toExclusive: parseDateEndExclusive(query.to),
    categoryId: query.categoryId,
    accountId: query.accountId,
    kind: query.kind,
    origin: query.origin,
    search: query.search,
    page: query.page,
    limit: query.limit,
  };
}

function toListItem(row: TransactionListRow): TransactionListItem {
  return {
    id: row.id,
    description: row.description,
    amount: row.amount,
    currency: row.currency,
    kind: row.kind,
    occurredAt: row.occurredAt,
    origin: row.origin,
    category:
      row.categoryId && row.categoryName && row.categoryColor
        ? {
            id: row.categoryId,
            name: row.categoryName,
            color: row.categoryColor,
          }
        : null,
    account: {
      id: row.accountId,
      name: row.accountName,
    },
  };
}

export async function listTransactions(
  db: Database,
  userId: string,
  query: TransactionsQuery,
  { repository = transactionRepository }: Deps = {},
): Promise<TransactionListResult> {
  const { items, total } = await repository.listFiltered(
    db,
    userId,
    toFilters(query),
  );

  return {
    items: items.map(toListItem),
    total,
    page: query.page,
    hasNext: query.page * query.limit < total,
  };
}
