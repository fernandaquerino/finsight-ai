import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { users } from "./users";

export const userProfiles = pgTable(
  "user_profiles",
  {
    userId: uuid("user_id")
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    currency: varchar("currency", { length: 3 }).default("BRL").notNull(),
    primaryGoal: text("primary_goal"),
    closingDay: integer("closing_day"),
    aiConsentAt: timestamp("ai_consent_at", { withTimezone: true }),
  },
  (table) => [
    index("user_profiles_user_id_idx").on(table.userId),
    check(
      "user_profiles_closing_day_check",
      sql`${table.closingDay} IS NULL OR (${table.closingDay} >= 1 AND ${table.closingDay} <= 31)`,
    ),
  ],
);

export type UserProfile = InferSelectModel<typeof userProfiles>;
export type NewUserProfile = InferInsertModel<typeof userProfiles>;
