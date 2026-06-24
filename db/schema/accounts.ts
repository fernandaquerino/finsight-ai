import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  index,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "./users";

export const accountType = pgEnum("account_type", [
  "checking",
  "savings",
  "credit_card",
  "investment",
  "other",
]);

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: accountType("type").notNull(),
    institution: text("institution"),
    // Saldo inicial informado na criação da conta (opcional). numeric preserva
    // precisão decimal. Saldos correntes futuros derivam das transações.
    initialBalance: numeric("initial_balance", { precision: 14, scale: 2 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [index("accounts_user_id_idx").on(table.userId)],
);

export type Account = InferSelectModel<typeof accounts>;
export type NewAccount = InferInsertModel<typeof accounts>;
