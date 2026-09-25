import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  index,
  numeric,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "./users";

export const debtKind = pgEnum("debt_kind", [
  "credit_card",
  "personal_loan",
  "financing",
  "consumer_credit",
  "other",
]);

export const debts = pgTable(
  "debts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    kind: debtKind("kind").notNull(),
    // Valor contratado — base para a barra de progresso ("quanto já foi pago").
    totalAmount: numeric("total_amount", {
      precision: 14,
      scale: 2,
    }).notNull(),
    remainingAmount: numeric("remaining_amount", {
      precision: 14,
      scale: 2,
    }).notNull(),
    monthlyPayment: numeric("monthly_payment", { precision: 14, scale: 2 }),
    // Juros mensais em pontos percentuais (13.900 = 13,9% a.m.). Guardado com 3
    // casas para acomodar taxas como 1,99%.
    interestRate: numeric("interest_rate", { precision: 6, scale: 3 })
      .default("0")
      .notNull(),
    // Dia do vencimento da parcela (1-31). Validado no schema Zod.
    dueDay: smallint("due_day"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [index("debts_user_id_idx").on(table.userId)],
);

export type Debt = InferSelectModel<typeof debts>;
export type NewDebt = InferInsertModel<typeof debts>;
