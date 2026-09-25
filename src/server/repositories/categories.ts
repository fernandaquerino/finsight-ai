import { and, asc, eq } from "drizzle-orm";

import { categories, type NewCategory } from "@/../db/schema";

import type { Database } from "./types";

type CategoryUpdate = Partial<
  Pick<NewCategory, "name" | "color" | "icon" | "monthlyBudget">
>;

// categories não tem soft delete (sem coluna deleted_at). Filtra por userId.
export const categoryRepository = {
  listByUser(db: Database, userId: string) {
    return db
      .select()
      .from(categories)
      .where(eq(categories.userId, userId))
      .orderBy(asc(categories.name));
  },

  async findById(db: Database, userId: string, id: string) {
    const [category] = await db
      .select()
      .from(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)))
      .limit(1);

    return category;
  },

  async create(db: Database, data: NewCategory) {
    const [category] = await db.insert(categories).values(data).returning();

    if (!category) {
      throw new Error("Failed to create category");
    }

    return category;
  },

  async update(db: Database, userId: string, id: string, data: CategoryUpdate) {
    const [category] = await db
      .update(categories)
      .set(data)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)))
      .returning();

    return category;
  },

  // Hard delete: categories não tem deleted_at. O service garante antes que
  // as transações foram movidas para outra categoria (nunca ficam órfãs).
  async delete(db: Database, userId: string, id: string) {
    const [category] = await db
      .delete(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)))
      .returning();

    return category;
  },

  // Insere ignorando categorias que já existam (mesmo userId + name + kind).
  // Torna o onboarding idempotente: rodar duas vezes não duplica.
  async createManyIfAbsent(db: Database, rows: NewCategory[]) {
    if (rows.length === 0) {
      return;
    }

    await db
      .insert(categories)
      .values(rows)
      .onConflictDoNothing({
        target: [categories.userId, categories.name, categories.kind],
      });
  },
};
