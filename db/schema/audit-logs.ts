import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "./users";

export const auditAction = pgEnum("audit_action", [
  "data_export",
  "account_delete",
  "import_confirmed",
]);

// Tabela append-only: registra ações sensíveis para auditoria (LGPD/GDPR).
//
// IMPORTANTE — append-only por convenção: o repository de audit expõe APENAS
// insert e select. Nunca UPDATE/DELETE. Defesa adicional via trigger no banco
// (REVOKE/trigger que bloqueia update/delete) fica para o hardening (v1.0).
// A única exclusão permitida é o hard delete no fluxo de exclusão de conta.
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    // onDelete: set null (e coluna nullable) — o log sobrevive à exclusão da
    // conta. Ao excluir o usuário, o vínculo de PII é removido (user_id = NULL),
    // mas o registro do evento (action, target, created_at) permanece como
    // prova de auditoria/conformidade LGPD. Não usar cascade aqui: apagaria a
    // própria trilha que comprova a exclusão.
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    action: auditAction("action").notNull(),
    // Alvo da ação: tipo (ex.: "import_job", "user") + id do recurso.
    targetType: text("target_type").notNull(),
    targetId: uuid("target_id"),
    // Contexto adicional sem PII (ex.: contagem de linhas, formato exportado).
    // Nunca armazenar valores de transação, descrições de extrato ou segredos.
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("audit_logs_user_id_created_at_idx").on(
      table.userId,
      table.createdAt,
    ),
  ],
);

export type AuditLog = InferSelectModel<typeof auditLogs>;
export type NewAuditLog = InferInsertModel<typeof auditLogs>;
