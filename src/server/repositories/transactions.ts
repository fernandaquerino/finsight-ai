import { and, desc, eq, gte, isNull, lt } from "drizzle-orm";

import {
  accounts,
  categories,
  transactions,
  type NewTransaction,
} from "@/../db/schema";

import type { Database } from "./types";

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
