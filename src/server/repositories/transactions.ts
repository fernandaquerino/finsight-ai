import { and, desc, eq, gte, isNull, lt } from "drizzle-orm";

import { transactions, type NewTransaction } from "@/../db/schema";

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
