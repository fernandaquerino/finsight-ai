import {
  auditLogRepository,
  userRepository,
  type Database,
} from "@/server/repositories";

import { UserNotFoundError } from "./errors";

// Exclusão de conta (LGPD/GDPR art. 18 VI): hard delete de tudo.
//
// O audit log é gravado ANTES do delete, dentro da mesma transação: naquele
// momento o userId ainda existe, e o cascade do próprio delete coloca
// audit_logs.user_id em NULL (onDelete: set null). O resultado é uma linha
// anônima que registra que a exclusão aconteceu — a prova sobrevive ao dado.
//
// Todas as tabelas de domínio têm FK com onDelete: cascade para users, então um
// único DELETE apaga perfil, contas, categorias, transações, metas, dívidas,
// preferências e as sessões/contas OAuth do Auth.js.
export async function deleteUserAccount(
  db: Database,
  userId: string,
): Promise<{ id: string }> {
  return db.transaction(async (tx) => {
    await auditLogRepository.record(tx, {
      userId,
      action: "account_delete",
      targetType: "user",
      targetId: userId,
      metadata: { reason: "self_service" },
    });

    const deleted = await userRepository.hardDelete(tx, userId);

    if (!deleted) {
      throw new UserNotFoundError();
    }

    return { id: deleted.id };
  });
}
