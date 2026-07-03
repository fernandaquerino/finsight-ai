import {
  and,
  count,
  desc,
  eq,
  gte,
  ilike,
  isNull,
  lt,
  or,
  type SQL,
} from "drizzle-orm";

import {
  accounts,
  categories,
  transactions,
  type NewTransaction,
} from "@/../db/schema";

import type { Database } from "./types";

export type TransactionListFilters = {
  from?: Date;
  toExclusive?: Date;
  categoryId?: string;
  accountId?: string;
  kind?: "income" | "expense" | "transfer";
  origin?: "manual" | "import" | "recurring" | "integration";
  search?: string;
  page: number;
  limit: number;
};

function buildListConditions(
  userId: string,
  filters: TransactionListFilters,
): SQL[] {
  const conditions: SQL[] = [
    eq(transactions.userId, userId),
    isNull(transactions.deletedAt),
  ];

  if (filters.from) {
    conditions.push(gte(transactions.occurredAt, filters.from));
  }

  if (filters.toExclusive) {
    conditions.push(lt(transactions.occurredAt, filters.toExclusive));
  }

  if (filters.categoryId) {
    conditions.push(eq(transactions.categoryId, filters.categoryId));
  }

  if (filters.accountId) {
    conditions.push(eq(transactions.accountId, filters.accountId));
  }

  if (filters.kind) {
    conditions.push(eq(transactions.kind, filters.kind));
  }

  if (filters.origin) {
    conditions.push(eq(transactions.origin, filters.origin));
  }

  if (filters.search) {
    const pattern = `%${filters.search}%`;
    const searchCondition = or(
      ilike(transactions.description, pattern),
      ilike(categories.name, pattern),
      ilike(accounts.name, pattern),
    );

    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  return conditions;
}

// Toda query filtra por userId (isolamento) e ignora soft-deleted.
// Ordenação padrão: mais recente primeiro (occurred_at desc).
export const transactionRepository = {
  listByUser(db: Database, userId: string) {
    return db
      .select()
      .from(transactions)
      .where(
        and(eq(transactions.userId, userId), isNull(transactions.deletedAt)),
      )
      .orderBy(desc(transactions.occurredAt));
  },

  // Transações de um período [from, toExclusive), isoladas por userId e sem
  // soft-deleted. Mais recentes primeiro.
  listByUserInPeriod(
    db: Database,
    userId: string,
    from: Date,
    toExclusive: Date,
  ) {
    return db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          isNull(transactions.deletedAt),
          gte(transactions.occurredAt, from),
          lt(transactions.occurredAt, toExclusive),
        ),
      )
      .orderBy(desc(transactions.occurredAt));
  },

  // Valores de despesa no período com o nome da categoria (join). Base para o
  // donut de composição de gastos. Isolado por userId, sem soft-deleted.
  listExpenseCategoryAmounts(
    db: Database,
    userId: string,
    from: Date,
    toExclusive: Date,
  ) {
    return db
      .select({
        categoryName: categories.name,
        amount: transactions.amount,
      })
      .from(transactions)
      .leftJoin(categories, eq(categories.id, transactions.categoryId))
      .where(
        and(
          eq(transactions.userId, userId),
          isNull(transactions.deletedAt),
          eq(transactions.kind, "expense"),
          gte(transactions.occurredAt, from),
          lt(transactions.occurredAt, toExclusive),
        ),
      );
  },

  // N transações mais recentes (todas as datas) com nome de categoria e conta.
  // Para a lista "atividade recente" do dashboard.
  listRecentWithRelations(db: Database, userId: string, limit: number) {
    return db
      .select({
        id: transactions.id,
        description: transactions.description,
        amount: transactions.amount,
        kind: transactions.kind,
        occurredAt: transactions.occurredAt,
        categoryName: categories.name,
        accountName: accounts.name,
      })
      .from(transactions)
      .leftJoin(categories, eq(categories.id, transactions.categoryId))
      .leftJoin(accounts, eq(accounts.id, transactions.accountId))
      .where(
        and(eq(transactions.userId, userId), isNull(transactions.deletedAt)),
      )
      .orderBy(desc(transactions.occurredAt))
      .limit(limit);
  },

  async listFiltered(
    db: Database,
    userId: string,
    filters: TransactionListFilters,
  ) {
    const conditions = buildListConditions(userId, filters);
    const where = and(...conditions);
    const offset = (filters.page - 1) * filters.limit;

    const items = await db
      .select({
        id: transactions.id,
        description: transactions.description,
        amount: transactions.amount,
        currency: transactions.currency,
        kind: transactions.kind,
        occurredAt: transactions.occurredAt,
        origin: transactions.origin,
        isRecurring: transactions.isRecurring,
        categoryId: transactions.categoryId,
        categoryName: categories.name,
        categoryColor: categories.color,
        accountId: transactions.accountId,
        accountName: accounts.name,
      })
      .from(transactions)
      .leftJoin(categories, eq(categories.id, transactions.categoryId))
      .leftJoin(accounts, eq(accounts.id, transactions.accountId))
      .where(where)
      .orderBy(desc(transactions.occurredAt), desc(transactions.createdAt))
      .limit(filters.limit)
      .offset(offset);

    const [totalRow] = await db
      .select({ total: count() })
      .from(transactions)
      .leftJoin(categories, eq(categories.id, transactions.categoryId))
      .leftJoin(accounts, eq(accounts.id, transactions.accountId))
      .where(where);

    return {
      items,
      total: totalRow?.total ?? 0,
    };
  },

  async hasAny(db: Database, userId: string) {
    const [transaction] = await db
      .select({ id: transactions.id })
      .from(transactions)
      .where(
        and(eq(transactions.userId, userId), isNull(transactions.deletedAt)),
      )
      .limit(1);

    return Boolean(transaction);
  },

  async findById(db: Database, userId: string, id: string) {
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.id, id),
          eq(transactions.userId, userId),
          isNull(transactions.deletedAt),
        ),
      )
      .limit(1);

    return transaction;
  },

  async create(db: Database, data: NewTransaction) {
    const [transaction] = await db
      .insert(transactions)
      .values(data)
      .returning();

    if (!transaction) {
      throw new Error("Failed to create transaction");
    }

    return transaction;
  },

  async update(
    db: Database,
    userId: string,
    id: string,
    data: Partial<
      Pick<
        NewTransaction,
        | "accountId"
        | "categoryId"
        | "amount"
        | "kind"
        | "description"
        | "occurredAt"
        | "dedupeHash"
        | "isRecurring"
      >
    >,
  ) {
    const [transaction] = await db
      .update(transactions)
      .set(data)
      .where(
        and(
          eq(transactions.id, id),
          eq(transactions.userId, userId),
          isNull(transactions.deletedAt),
        ),
      )
      .returning();

    return transaction;
  },

  async softDelete(db: Database, userId: string, id: string) {
    const [transaction] = await db
      .update(transactions)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(transactions.id, id),
          eq(transactions.userId, userId),
          isNull(transactions.deletedAt),
        ),
      )
      .returning();

    return transaction;
  },
};
