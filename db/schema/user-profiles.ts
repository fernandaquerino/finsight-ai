import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
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
    // Mês a partir do qual o usuário quer acompanhar (passo 2 do onboarding).
    // Armazenado como date (primeiro dia do mês).
    trackingStartMonth: date("tracking_start_month"),
    aiConsentAt: timestamp("ai_consent_at", { withTimezone: true }),
    // Marca a conclusão do onboarding. Independente de ai_consent_at: o usuário
    // pode pular o onboarding (sem consentir IA) e ainda assim não repeti-lo.
    onboardingCompletedAt: timestamp("onboarding_completed_at", {
      withTimezone: true,
    }),
    // Contato opcional, informado em Minha conta. Usado apenas para alertas que
    // o usuário ativar — nunca em logs.
    phone: text("phone"),
    // CPF em dígitos, sem máscara. PII sensível: nunca sai do servidor em claro
    // (a API devolve só a versão mascarada) e nunca é logado.
    cpf: varchar("cpf", { length: 11 }),
    // Preferências de IA. Moram aqui, ao lado de ai_consent_at, porque só fazem
    // sentido quando existe consentimento.
    aiAutoCategorize: boolean("ai_auto_categorize").default(true).notNull(),
    aiProactiveInsights: boolean("ai_proactive_insights")
      .default(true)
      .notNull(),
  },
  (table) => [
    index("user_profiles_user_id_idx").on(table.userId),
    check(
      "user_profiles_closing_day_check",
      sql`${table.closingDay} IS NULL OR (${table.closingDay} >= 1 AND ${table.closingDay} <= 31)`,
    ),
    check(
      "user_profiles_cpf_check",
      sql`${table.cpf} IS NULL OR ${table.cpf} ~ '^[0-9]{11}$'`,
    ),
  ],
);

export type UserProfile = InferSelectModel<typeof userProfiles>;
export type NewUserProfile = InferInsertModel<typeof userProfiles>;
