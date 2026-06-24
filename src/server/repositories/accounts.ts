import { and, eq, isNull } from "drizzle-orm";

import { accounts, type NewAccount } from "@/../db/schema";

import type { Database } from "./types";

// Toda query filtra por userId (isolamento) e ignora registros soft-deleted.
export const accountRepository = {
  listByUser(db: Database, userId: string) {
    return db
      .select()
      .from(accounts)
      .where(and(eq(accounts.userId, userId), isNull(accounts.deletedAt)));
  },

  async findById(db: Database, userId: string, id: string) {
    const [account] = await db
      .select()
      .from(accounts)
      .where(
        and(
          eq(accounts.id, id),
          eq(accounts.userId, userId),
          isNull(accounts.deletedAt),
        ),
      )
      .limit(1);

    return account;
  },

  async create(db: Database, data: NewAccount) {
    const [account] = await db.insert(accounts).values(data).returning();

    if (!account) {
      throw new Error("Failed to create account");
    }

    return account;
  },

  // Soft delete: marca deleted_at. Filtra por userId para impedir que um
  // usuário apague conta de outro.
  async softDelete(db: Database, userId: string, id: string) {
    const [account] = await db
      .update(accounts)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(accounts.id, id),
          eq(accounts.userId, userId),
          isNull(accounts.deletedAt),
        ),
      )
      .returning();

    return account;
  },
};
