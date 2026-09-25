import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  date,
  index,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { users } from "./users";

export const goals = pgTable(
  "goals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    // Chave do ícone (allowlist em lib/goals/goal-icons).
    icon: varchar("icon", { length: 32 }),
    // numeric preserva a precisão decimal — nada de float em valor financeiro.
    targetAmount: numeric("target_amount", {
      precision: 14,
      scale: 2,
    }).notNull(),
    currentAmount: numeric("current_amount", { precision: 14, scale: 2 })
      .default("0")
      .notNull(),
    // Aporte mensal planejado. Nulo → sem projeção de prazo.
    monthlyContribution: numeric("monthly_contribution", {
      precision: 14,
      scale: 2,
    }),
    // Prazo desejado (date, sem hora: é uma data-alvo, não um instante).
    deadline: date("deadline"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [index("goals_user_id_idx").on(table.userId)],
);

export type Goal = InferSelectModel<typeof goals>;
export type NewGoal = InferInsertModel<typeof goals>;
