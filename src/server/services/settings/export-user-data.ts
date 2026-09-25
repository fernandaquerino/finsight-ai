import {
  accountRepository,
  auditLogRepository,
  categoryRepository,
  debtRepository,
  goalRepository,
  notificationPreferenceRepository,
  transactionRepository,
  userProfileRepository,
  userRepository,
  type Database,
} from "@/server/repositories";

import { UserNotFoundError } from "./errors";

export type UserDataExport = {
  exportedAt: string;
  // Formato versionado: um export baixado hoje precisa continuar legível quando
  // o schema mudar.
  schemaVersion: 1;
  user: Record<string, unknown>;
  profile: Record<string, unknown> | null;
  notificationPreferences: Record<string, unknown> | null;
  accounts: readonly unknown[];
  categories: readonly unknown[];
  transactions: readonly unknown[];
  goals: readonly unknown[];
  debts: readonly unknown[];
};

export type UserDataExportResult = {
  data: UserDataExport;
  // Só contagens — é o que vai para o audit log. Nunca valores financeiros.
  counts: Record<string, number>;
};

// Export self-service (LGPD/GDPR art. 15 / art. 18 V). Todos os repositories
// filtram por userId, então o pacote contém exclusivamente dados do titular.
export async function exportUserData(
  db: Database,
  userId: string,
): Promise<UserDataExportResult> {
  const [
    user,
    profile,
    notificationPreferences,
    accounts,
    categories,
    transactions,
    goals,
    debts,
  ] = await Promise.all([
    userRepository.findById(db, userId),
    userProfileRepository.getByUserId(db, userId),
    notificationPreferenceRepository.getByUserId(db, userId),
    accountRepository.listByUser(db, userId),
    categoryRepository.listByUser(db, userId),
    transactionRepository.listByUser(db, userId),
    goalRepository.listByUser(db, userId),
    debtRepository.listByUser(db, userId),
  ]);

  if (!user) {
    throw new UserNotFoundError();
  }

  // passwordHash fica fora: é segredo de autenticação, não dado pessoal útil ao
  // titular, e exportá-lo transformaria o arquivo baixado num alvo.
  const { passwordHash: _passwordHash, ...safeUser } = user;

  const data: UserDataExport = {
    exportedAt: new Date().toISOString(),
    schemaVersion: 1,
    user: safeUser,
    profile: profile ?? null,
    notificationPreferences: notificationPreferences ?? null,
    accounts,
    categories,
    transactions,
    goals,
    debts,
  };

  const counts = {
    accounts: accounts.length,
    categories: categories.length,
    transactions: transactions.length,
    goals: goals.length,
    debts: debts.length,
  };

  // Auditoria: registra o evento com contagens e nada mais.
  await auditLogRepository.record(db, {
    userId,
    action: "data_export",
    targetType: "user",
    targetId: userId,
    metadata: { scope: "full_account", ...counts },
  });

  return { data, counts };
}
