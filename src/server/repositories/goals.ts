import { and, asc, eq, isNull } from "drizzle-orm";

import { goals, type NewGoal } from "@/../db/schema";

import type { Database } from "./types";

type GoalUpdate = Partial<
  Pick<
    NewGoal,
    | "name"
    | "icon"
    | "targetAmount"
    | "currentAmount"
    | "monthlyContribution"
    | "deadline"
  >
>;

// Soft delete (deleted_at) para preservar auditoria. Toda query filtra por
// userId — o id vindo do cliente nunca é suficiente para autorizar acesso.
export const goalRepository = {
  listByUser(db: Database, userId: string) {
    return db
      .select()
      .from(goals)
      .where(and(eq(goals.userId, userId), isNull(goals.deletedAt)))
      .orderBy(asc(goals.createdAt));
  },

  async findById(db: Database, userId: string, id: string) {
    const [goal] = await db
      .select()
      .from(goals)
      .where(
        and(
          eq(goals.id, id),
          eq(goals.userId, userId),
          isNull(goals.deletedAt),
        ),
      )
      .limit(1);

    return goal;
  },

  async create(db: Database, data: NewGoal) {
    const [goal] = await db.insert(goals).values(data).returning();

    if (!goal) {
      throw new Error("Failed to create goal");
    }

    return goal;
  },

  async update(db: Database, userId: string, id: string, data: GoalUpdate) {
    const [goal] = await db
      .update(goals)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(
          eq(goals.id, id),
          eq(goals.userId, userId),
          isNull(goals.deletedAt),
        ),
      )
      .returning();

    return goal;
  },

  async softDelete(db: Database, userId: string, id: string) {
    const [goal] = await db
      .update(goals)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(goals.id, id),
          eq(goals.userId, userId),
          isNull(goals.deletedAt),
        ),
      )
      .returning();

    return goal;
  },
};
