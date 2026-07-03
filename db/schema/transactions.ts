import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { accounts } from "./accounts";
import { categories } from "./categories";
import { users } from "./users";

export const transactionKind = pgEnum("transaction_kind", [
  "income",
  "expense",
  "transfer",
]);

export const transactionOrigin = pgEnum("transaction_origin", [
  "manual",
  "import",
  "recurring",
  "integration",
]);

export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    // numeric preserva precisão decimal (sem erro de ponto flutuante em valores
    // financeiros). amount é sempre positivo; `kind` define a direção.
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("BRL").notNull(),
    kind: transactionKind("kind").notNull(),
    description: text("description"),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    origin: transactionOrigin("origin").notNull(),
    // Marca uma transação como recorrente (repete periodicamente). A geração
    // automática de ocorrências futuras é um épico à parte (Future); por ora
    // é um marcador editável pelo usuário.
    isRecurring: boolean("is_recurring").default(false).notNull(),
    // dedupe_hash = sha256(date + amount + description + account_id).
    // Calculado na camada de service antes do insert.
    dedupeHash: text("dedupe_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    // Índice composto para listagem por usuário ordenada/filtrada por data.
    index("transactions_user_id_occurred_at_idx").on(
      table.userId,
      table.occurredAt,
    ),
    // Deduplicação: hash único por conta. Parcial (deleted_at IS NULL) para
    // permitir reinserir uma transação após soft delete da anterior.
    uniqueIndex("transactions_account_id_dedupe_hash_unique_idx")
      .on(table.accountId, table.dedupeHash)
      .where(sql`${table.deletedAt} IS NULL`),
  ],
);

export type Transaction = InferSelectModel<typeof transactions>;
export type NewTransaction = InferInsertModel<typeof transactions>;
