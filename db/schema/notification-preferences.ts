import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { boolean, index, pgTable, uuid } from "drizzle-orm/pg-core";

import { users } from "./users";

// Preferências de notificação: relação 1:1 com users (userId como PK), como
// user_profiles. Tabela separada — e não colunas em user_profiles — porque é o
// que docs/architecture.md prescreve e porque a lista de canais/alertas tende a
// crescer independente do perfil.
//
// Desvio consciente do doc: a coluna anomaly_alerts não é criada aqui. Não há
// nada no produto que a controle hoje; coluna morta é pior que coluna ausente.
export const notificationPreferences = pgTable(
  "notification_preferences",
  {
    userId: uuid("user_id")
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    // Quando uma categoria estoura o orçamento definido.
    spendAlerts: boolean("spend_alerts").default(true).notNull(),
    // Resumo semanal do progresso das metas.
    weeklySummary: boolean("weekly_summary").default(true).notNull(),
    // Aviso antes do vencimento de cada parcela de dívida.
    installmentReminders: boolean("installment_reminders")
      .default(false)
      .notNull(),
  },
  (table) => [index("notification_preferences_user_id_idx").on(table.userId)],
);

export type NotificationPreferences = InferSelectModel<
  typeof notificationPreferences
>;
export type NewNotificationPreferences = InferInsertModel<
  typeof notificationPreferences
>;
