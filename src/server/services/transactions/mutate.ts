import { computeDedupeHash } from "@/lib/transactions/dedupe";
import {
  accountRepository,
  categoryRepository,
  transactionRepository,
  type Database,
} from "@/server/repositories";
import { invalidateDashboardCache } from "@/server/services/dashboard/cache";
import type {
  CreateTransactionInput,
  UpdateTransactionInput,
} from "@/server/validators/transactions";

// Mutações de transação passam por aqui para: (1) calcular o dedupe_hash antes
// do insert, (2) validar a propriedade de conta/categoria (isolamento por
// usuário), (3) invalidar o cache do dashboard em qualquer escrita.
// `invalidate` é injetável para teste; em produção usa o cache real.
type Deps = {
  invalidate?: (userId: string) => Promise<void>;
};

// Erros de domínio tipados — os handlers traduzem em status HTTP corretos.
export class TransactionOwnershipError extends Error {
  readonly code = "INVALID_REFERENCE";
  constructor(message: string) {
    super(message);
    this.name = "TransactionOwnershipError";
  }
}

export class DuplicateTransactionError extends Error {
  readonly code = "DUPLICATE_TRANSACTION";
  constructor(message = "Já existe uma transação idêntica nesta conta.") {
    super(message);
    this.name = "DuplicateTransactionError";
  }
}

// Postgres unique_violation.
function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "23505"
  );
}

// occurred_at chega como YYYY-MM-DD. Fixamos meio-dia UTC para evitar que o
// fuso empurre a data para o dia anterior/seguinte.
function parseOccurredAt(value: string): Date {
  return new Date(`${value}T12:00:00.000Z`);
}

// Garante que a conta pertence ao usuário e, se houver categoria, idem.
// Nunca confiar em IDs vindos do cliente para autorização.
async function assertReferencesBelongToUser(
  db: Database,
  userId: string,
  accountId: string,
  categoryId: string | null | undefined,
): Promise<void> {
  const account = await accountRepository.findById(db, userId, accountId);
  if (!account) {
    throw new TransactionOwnershipError("Conta não encontrada.");
  }

  if (categoryId) {
    const category = await categoryRepository.findById(db, userId, categoryId);
    if (!category) {
      throw new TransactionOwnershipError("Categoria não encontrada.");
    }
  }
}

export async function createTransaction(
  db: Database,
  userId: string,
  input: CreateTransactionInput,
  { invalidate = invalidateDashboardCache }: Deps = {},
) {
  await assertReferencesBelongToUser(
    db,
    userId,
    input.accountId,
    input.categoryId,
  );

  const occurredAt = parseOccurredAt(input.occurredAt);
  const amount = input.amount.toFixed(2);
  const dedupeHash = computeDedupeHash({
    occurredAt,
    amount,
    description: input.description,
    accountId: input.accountId,
  });

  let created;
  try {
    created = await transactionRepository.create(db, {
      userId,
      accountId: input.accountId,
      categoryId: input.categoryId ?? null,
      amount,
      currency: input.currency,
      kind: input.kind,
      description: input.description,
      occurredAt,
      origin: "manual",
      dedupeHash,
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new DuplicateTransactionError();
    }
    throw error;
  }

  await invalidate(userId);
  return created;
}

export async function updateTransaction(
  db: Database,
  userId: string,
  id: string,
  input: UpdateTransactionInput,
  { invalidate = invalidateDashboardCache }: Deps = {},
) {
  const current = await transactionRepository.findById(db, userId, id);
  if (!current) {
    return undefined;
  }

  // Valores efetivos após o patch — base para recalcular o dedupe_hash quando
  // qualquer campo que o compõe muda.
  const accountId = input.accountId ?? current.accountId;
  const categoryId =
    input.categoryId !== undefined ? input.categoryId : current.categoryId;
  const amount =
    input.amount !== undefined ? input.amount.toFixed(2) : current.amount;
  const description =
    input.description !== undefined ? input.description : current.description;
  const occurredAt =
    input.occurredAt !== undefined
      ? parseOccurredAt(input.occurredAt)
      : current.occurredAt;

  if (input.accountId !== undefined || input.categoryId) {
    await assertReferencesBelongToUser(db, userId, accountId, categoryId);
  }

  const dedupeHash = computeDedupeHash({
    occurredAt,
    amount,
    description,
    accountId,
  });

  let updated;
  try {
    updated = await transactionRepository.update(db, userId, id, {
      accountId,
      categoryId,
      amount,
      kind: input.kind ?? current.kind,
      description,
      occurredAt,
      dedupeHash,
      isRecurring: input.isRecurring ?? current.isRecurring,
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new DuplicateTransactionError();
    }
    throw error;
  }

  if (updated) {
    await invalidate(userId);
  }
  return updated;
}

export async function deleteTransaction(
  db: Database,
  userId: string,
  id: string,
  { invalidate = invalidateDashboardCache }: Deps = {},
) {
  const deleted = await transactionRepository.softDelete(db, userId, id);
  if (deleted) {
    await invalidate(userId);
  }
  return deleted;
}
