import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  index,
  pgEnum,
  pgTable,
  text,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import type { AnyPgColumn } from "drizzle-orm/pg-core";

import { users } from "./users";

export const categoryKind = pgEnum("category_kind", ["income", "expense"]);

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    color: varchar("color", { length: 7 }).notNull(),
    kind: categoryKind("kind").notNull(),
    parentId: uuid("parent_id").references((): AnyPgColumn => categories.id, {
      onDelete: "set null",
    }),
  },
  (table) => [
    index("categories_user_id_idx").on(table.userId),
    index("categories_parent_id_idx").on(table.parentId),
    // Evita categorias duplicadas por usuário (mesmo nome + tipo). userId nulo
    // (categorias globais) é tratado como distinto pelo Postgres, sem conflito.
    uniqueIndex("categories_user_id_name_kind_unique_idx").on(
      table.userId,
      table.name,
      table.kind,
    ),
  ],
);

export type Category = InferSelectModel<typeof categories>;
export type NewCategory = InferInsertModel<typeof categories>;
