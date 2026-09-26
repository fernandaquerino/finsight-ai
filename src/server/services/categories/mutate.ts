import { categoryMap, resolveCategoryIconKey } from "@/lib/categories";
import {
  categoryRepository,
  transactionRepository,
  type Database,
} from "@/server/repositories";
import { invalidateDerivedCaches } from "@/server/services/cache/invalidate";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/server/validators/categories";

// Mutações de categoria: validam unicidade (nome normalizado + tipo), protegem
// a categoria "Outros" (destino das transações de categorias excluídas) e
// invalidam o cache do dashboard, que exibe nome/cor das categorias.
type Deps = {
  invalidate?: (userId: string) => Promise<void>;
};

export class DuplicateCategoryError extends Error {
  readonly code = "DUPLICATE_CATEGORY";
  constructor(message = "Já existe uma categoria com esse nome.") {
    super(message);
    this.name = "DuplicateCategoryError";
  }
}

export class CategoryNotFoundError extends Error {
  readonly code = "NOT_FOUND";
  constructor(message = "Categoria não encontrada.") {
    super(message);
    this.name = "CategoryNotFoundError";
  }
}

export class ProtectedCategoryError extends Error {
  readonly code = "PROTECTED_CATEGORY";
  constructor(
    message = "A categoria Outros recebe as transações de categorias excluídas e não pode ser removida.",
  ) {
    super(message);
    this.name = "ProtectedCategoryError";
  }
}

const FALLBACK_CATEGORY_NAME = categoryMap.outros.label;

export function normalizeCategoryName(name: string): string {
  return name.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function isFallbackCategory(name: string): boolean {
  return (
    normalizeCategoryName(name) ===
    normalizeCategoryName(FALLBACK_CATEGORY_NAME)
  );
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "23505"
  );
}

function toBudgetColumn(
  value: number | null | undefined,
): string | null | undefined {
  if (value === undefined) return undefined;
  return value === null ? null : value.toFixed(2);
}

// Checagem antes do insert (case/acento-insensível — a constraint do banco só
// pega o nome exato). A constraint continua como rede de segurança.
async function assertNameAvailable(
  db: Database,
  userId: string,
  name: string,
  kind: "income" | "expense",
  ignoreId?: string,
): Promise<void> {
  const normalized = normalizeCategoryName(name);
  const existing = await categoryRepository.listByUser(db, userId);
  const clash = existing.some(
    (category) =>
      category.id !== ignoreId &&
      category.kind === kind &&
      normalizeCategoryName(category.name) === normalized,
  );

  if (clash) {
    throw new DuplicateCategoryError();
  }
}

export async function createCategory(
  db: Database,
  userId: string,
  input: CreateCategoryInput,
  { invalidate = invalidateDerivedCaches }: Deps = {},
) {
  await assertNameAvailable(db, userId, input.name, input.kind);

  let created;
  try {
    created = await categoryRepository.create(db, {
      userId,
      name: input.name,
      color: input.color,
      icon: input.icon,
      kind: input.kind,
      monthlyBudget: toBudgetColumn(input.monthlyBudget) ?? null,
    });
  } catch (error) {
    if (isUniqueViolation(error)) throw new DuplicateCategoryError();
    throw error;
  }

  await invalidate(userId);
  return created;
}

export async function updateCategory(
  db: Database,
  userId: string,
  id: string,
  input: UpdateCategoryInput,
  { invalidate = invalidateDerivedCaches }: Deps = {},
) {
  const current = await categoryRepository.findById(db, userId, id);
  if (!current) {
    return undefined;
  }

  if (input.name !== undefined) {
    // Renomear "Outros" quebraria o destino padrão das exclusões.
    if (isFallbackCategory(current.name) && !isFallbackCategory(input.name)) {
      throw new ProtectedCategoryError(
        "A categoria Outros não pode ser renomeada.",
      );
    }
    await assertNameAvailable(db, userId, input.name, current.kind, id);
  }

  let updated;
  try {
    updated = await categoryRepository.update(db, userId, id, {
      name: input.name,
      color: input.color,
      icon: input.icon,
      monthlyBudget: toBudgetColumn(input.monthlyBudget),
    });
  } catch (error) {
    if (isUniqueViolation(error)) throw new DuplicateCategoryError();
    throw error;
  }

  if (updated) {
    await invalidate(userId);
  }
  return updated;
}

// Exclui a categoria sem orfanizar transações: dentro de uma transação de
// banco, move tudo para "Outros" do mesmo tipo (criando-a se preciso) e só
// então remove a categoria.
export async function deleteCategory(
  db: Database,
  userId: string,
  id: string,
  { invalidate = invalidateDerivedCaches }: Deps = {},
) {
  const result = await db.transaction(async (tx) => {
    const category = await categoryRepository.findById(tx, userId, id);
    if (!category) {
      return undefined;
    }

    if (isFallbackCategory(category.name)) {
      throw new ProtectedCategoryError();
    }

    const categories = await categoryRepository.listByUser(tx, userId);
    const fallback =
      categories.find(
        (item) => item.kind === category.kind && isFallbackCategory(item.name),
      ) ??
      (await categoryRepository.create(tx, {
        userId,
        name: FALLBACK_CATEGORY_NAME,
        color: categoryMap.outros.color,
        icon: resolveCategoryIconKey({ name: FALLBACK_CATEGORY_NAME }),
        kind: category.kind,
      }));

    const movedCount = await transactionRepository.reassignCategory(
      tx,
      userId,
      category.id,
      fallback.id,
    );
    await categoryRepository.delete(tx, userId, category.id);

    return {
      id: category.id,
      movedCount,
      movedTo: { id: fallback.id, name: fallback.name },
    };
  });

  if (result) {
    await invalidate(userId);
  }
  return result;
}

export type CategoryBudgetUpdate = Readonly<{
  id: string;
  monthlyBudget: number | null;
}>;

// Edição em lote dos limites. Roda numa única transação: se um id não for do
// usuário, nada é gravado — melhor recusar tudo do que deixar o orçamento do
// mês pela metade. `update` já filtra por userId, então um id de outro usuário
// simplesmente não casa e vira 404.
export async function updateCategoryBudgets(
  db: Database,
  userId: string,
  budgets: readonly CategoryBudgetUpdate[],
  { invalidate = invalidateDerivedCaches }: Deps = {},
) {
  const updated = await db.transaction(async (tx) => {
    const rows = [];

    for (const budget of budgets) {
      const row = await categoryRepository.update(tx, userId, budget.id, {
        monthlyBudget: toBudgetColumn(budget.monthlyBudget) ?? null,
      });

      if (!row) {
        throw new CategoryNotFoundError();
      }

      rows.push(row);
    }

    return rows;
  });

  await invalidate(userId);
  return updated;
}
