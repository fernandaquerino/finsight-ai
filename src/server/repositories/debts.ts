import { and, asc, eq, isNull } from "drizzle-orm";

import { debts, type NewDebt } from "@/../db/schema";

import type { Database } from "./types";

type DebtUpdate = Partial<
  Pick<
    NewDebt,
    | "name"
    | "kind"
    | "totalAmount"
    | "remainingAmount"
    | "monthlyPayment"
    | "interestRate"
    | "dueDay"
  >
>;

// Soft delete (deleted_at) para preservar auditoria. Toda query filtra por
// userId — o id vindo do cliente nunca é suficiente para autorizar acesso.
export const debtRepository = {
  listByUser(db: Database, userId: string) {
    return db
      .select()
      .from(debts)
      .where(and(eq(debts.userId, userId), isNull(debts.deletedAt)))
      .orderBy(asc(debts.createdAt));
  },

  async findById(db: Database, userId: string, id: string) {
    const [debt] = await db
      .select()
      .from(debts)
      .where(
        and(
          eq(debts.id, id),
          eq(debts.userId, userId),
          isNull(debts.deletedAt),
        ),
      )
      .limit(1);

    return debt;
  },

  async create(db: Database, data: NewDebt) {
    const [debt] = await db.insert(debts).values(data).returning();

    if (!debt) {
      throw new Error("Failed to create debt");
    }

    return debt;
  },

  async update(db: Database, userId: string, id: string, data: DebtUpdate) {
    const [debt] = await db
      .update(debts)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(
          eq(debts.id, id),
          eq(debts.userId, userId),
          isNull(debts.deletedAt),
        ),
      )
      .returning();

    return debt;
  },

  async softDelete(db: Database, userId: string, id: string) {
    const [debt] = await db
      .update(debts)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(debts.id, id),
          eq(debts.userId, userId),
          isNull(debts.deletedAt),
        ),
      )
      .returning();

    return debt;
  },
};
