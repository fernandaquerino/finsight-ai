import { and, eq } from "drizzle-orm";

import { categories, type NewCategory } from "@/../db/schema";

import type { Database } from "./types";

// categories não tem soft delete (sem coluna deleted_at). Filtra por userId.
export const categoryRepository = {
  listByUser(db: Database, userId: string) {
    return db.select().from(categories).where(eq(categories.userId, userId));
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
};
