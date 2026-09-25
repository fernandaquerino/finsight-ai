import { goalRepository, type Database } from "@/server/repositories";
import type {
  CreateGoalInput,
  UpdateGoalInput,
} from "@/server/validators/goals";

// Mutações de meta. Toda operação recebe o userId da sessão e delega ao
// repository, que filtra por userId — o id do recurso vindo do cliente nunca
// basta para autorizar.
export class GoalNotFoundError extends Error {
  readonly code = "NOT_FOUND";
  constructor(message = "Meta não encontrada.") {
    super(message);
    this.name = "GoalNotFoundError";
  }
}

// numeric do Postgres é lido e escrito como string: converter na borda evita
// erro de ponto flutuante no valor armazenado.
function toNumericColumn(value: number): string;
function toNumericColumn(value: number | null): string | null;
function toNumericColumn(
  value: number | null | undefined,
): string | null | undefined;
function toNumericColumn(
  value: number | null | undefined,
): string | null | undefined {
  if (value === undefined) return undefined;
  return value === null ? null : value.toFixed(2);
}

export async function createGoal(
  db: Database,
  userId: string,
  input: CreateGoalInput,
) {
  const goal = await goalRepository.create(db, {
    userId,
    name: input.name,
    icon: input.icon,
    targetAmount: toNumericColumn(input.targetAmount),
    currentAmount: toNumericColumn(input.currentAmount),
    monthlyContribution: toNumericColumn(input.monthlyContribution),
    deadline: input.deadline,
  });

  return { id: goal.id };
}

export async function updateGoal(
  db: Database,
  userId: string,
  id: string,
  input: UpdateGoalInput,
) {
  const goal = await goalRepository.update(db, userId, id, {
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.icon !== undefined ? { icon: input.icon } : {}),
    ...(input.targetAmount !== undefined
      ? { targetAmount: toNumericColumn(input.targetAmount) }
      : {}),
    ...(input.currentAmount !== undefined
      ? { currentAmount: toNumericColumn(input.currentAmount) }
      : {}),
    ...(input.monthlyContribution !== undefined
      ? { monthlyContribution: toNumericColumn(input.monthlyContribution) }
      : {}),
    ...(input.deadline !== undefined ? { deadline: input.deadline } : {}),
  });

  if (!goal) {
    throw new GoalNotFoundError();
  }

  return { id: goal.id };
}

export async function deleteGoal(db: Database, userId: string, id: string) {
  const goal = await goalRepository.softDelete(db, userId, id);

  if (!goal) {
    throw new GoalNotFoundError();
  }

  return { id: goal.id, name: goal.name };
}
