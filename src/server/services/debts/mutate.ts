import { debtRepository, type Database } from "@/server/repositories";
import type {
  CreateDebtInput,
  UpdateDebtInput,
} from "@/server/validators/debts";

// Mutações de dívida. Toda operação recebe o userId da sessão e delega ao
// repository, que filtra por userId — o id do recurso vindo do cliente nunca
// basta para autorizar.
export class DebtNotFoundError extends Error {
  readonly code = "NOT_FOUND";
  constructor(message = "Dívida não encontrada.") {
    super(message);
    this.name = "DebtNotFoundError";
  }
}

export class InvalidDebtBalanceError extends Error {
  readonly code = "INVALID_BALANCE";
  constructor(
    message = "O saldo devedor não pode ser maior que o valor contratado.",
  ) {
    super(message);
    this.name = "InvalidDebtBalanceError";
  }
}

// numeric do Postgres é lido e escrito como string: converter na borda evita
// erro de ponto flutuante no valor armazenado.
function toNumericColumn(
  value: number | null | undefined,
  scale = 2,
): string | null | undefined {
  if (value === undefined) return undefined;
  return value === null ? null : value.toFixed(scale);
}

export async function createDebt(
  db: Database,
  userId: string,
  input: CreateDebtInput,
) {
  const debt = await debtRepository.create(db, {
    userId,
    name: input.name,
    kind: input.kind,
    totalAmount: input.totalAmount.toFixed(2),
    remainingAmount: input.remainingAmount.toFixed(2),
    monthlyPayment: toNumericColumn(input.monthlyPayment),
    interestRate: input.interestRate.toFixed(3),
    dueDay: input.dueDay,
  });

  return { id: debt.id };
}

// A validação de "saldo <= contratado" no Zod só alcança o que veio no corpo.
// Num PATCH parcial (só o saldo, por exemplo) é aqui que a regra é aplicada,
// comparando com o valor já gravado.
export async function updateDebt(
  db: Database,
  userId: string,
  id: string,
  input: UpdateDebtInput,
) {
  const current = await debtRepository.findById(db, userId, id);

  if (!current) {
    throw new DebtNotFoundError();
  }

  const nextTotal = input.totalAmount ?? Number(current.totalAmount);
  const nextRemaining =
    input.remainingAmount ?? Number(current.remainingAmount);

  if (nextRemaining > nextTotal) {
    throw new InvalidDebtBalanceError();
  }

  const debt = await debtRepository.update(db, userId, id, {
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.kind !== undefined ? { kind: input.kind } : {}),
    ...(input.totalAmount !== undefined
      ? { totalAmount: input.totalAmount.toFixed(2) }
      : {}),
    ...(input.remainingAmount !== undefined
      ? { remainingAmount: input.remainingAmount.toFixed(2) }
      : {}),
    ...(input.monthlyPayment !== undefined
      ? { monthlyPayment: toNumericColumn(input.monthlyPayment) }
      : {}),
    ...(input.interestRate !== undefined
      ? { interestRate: input.interestRate.toFixed(3) }
      : {}),
    ...(input.dueDay !== undefined ? { dueDay: input.dueDay } : {}),
  });

  if (!debt) {
    throw new DebtNotFoundError();
  }

  return { id: debt.id };
}

export async function deleteDebt(db: Database, userId: string, id: string) {
  const debt = await debtRepository.softDelete(db, userId, id);

  if (!debt) {
    throw new DebtNotFoundError();
  }

  return { id: debt.id, name: debt.name };
}
