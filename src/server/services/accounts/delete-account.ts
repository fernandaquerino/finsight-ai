import {
  accountRepository,
  transactionRepository,
  type Database,
} from "@/server/repositories";

export class AccountNotFoundError extends Error {
  readonly code = "NOT_FOUND";
  constructor(message = "Conta não encontrada.") {
    super(message);
    this.name = "AccountNotFoundError";
  }
}

export class AccountHasTransactionsError extends Error {
  readonly code = "ACCOUNT_HAS_TRANSACTIONS";
  constructor(
    message = "Esta conta tem lançamentos. Exclua ou mova as transações antes de remover a conta.",
  ) {
    super(message);
    this.name = "AccountHasTransactionsError";
  }
}

// Remove uma conta (soft delete, preservando auditoria).
//
// Regra de negócio: recusa se a conta ainda tiver lançamentos ativos. Sem essa
// checagem, o dashboard continuaria somando transações de uma conta que o
// usuário acredita ter removido — dado inconsistente é pior que um erro claro.
export async function deleteAccount(
  db: Database,
  userId: string,
  accountId: string,
): Promise<{ id: string; name: string }> {
  const account = await accountRepository.findById(db, userId, accountId);

  if (!account) {
    throw new AccountNotFoundError();
  }

  const hasTransactions = await transactionRepository.hasAnyForAccount(
    db,
    userId,
    accountId,
  );

  if (hasTransactions) {
    throw new AccountHasTransactionsError();
  }

  const deleted = await accountRepository.softDelete(db, userId, accountId);

  if (!deleted) {
    throw new AccountNotFoundError();
  }

  return { id: deleted.id, name: deleted.name };
}
