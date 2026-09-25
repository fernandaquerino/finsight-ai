import { getDb } from "@/lib/db";
import { DEFAULT_INCOME_CATEGORIES } from "@/features/onboarding/data/catalog";
import { resolveCategoryIconKey } from "@/lib/categories";
import { jsonError, jsonOk } from "@/server/api/responses";
import { UnauthorizedError, requireUserId } from "@/server/auth/session";
import { categoryRepository } from "@/server/repositories";
import {
  DuplicateCategoryError,
  createCategory,
} from "@/server/services/categories/mutate";
import { createCategorySchema } from "@/server/validators/categories";

export const runtime = "nodejs";

function normalizeCategoryName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// GET /api/categories — categorias do usuário autenticado, para popular selects.
// Isolado por userId (repository filtra).
export async function GET(): Promise<Response> {
  let userId: string;

  try {
    userId = await requireUserId();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return jsonError("UNAUTHORIZED", "Autenticação necessária.", 401);
    }
    throw error;
  }

  try {
    const db = getDb();
    const currentRows = await categoryRepository.listByUser(db, userId);
    const existingKeys = new Set(
      currentRows.map(
        (category) =>
          `${category.kind}:${normalizeCategoryName(category.name)}`,
      ),
    );

    const createdRows: typeof currentRows = [];
    for (const category of DEFAULT_INCOME_CATEGORIES) {
      const key = `${category.kind}:${normalizeCategoryName(category.name)}`;
      if (!existingKeys.has(key)) {
        createdRows.push(
          await categoryRepository.create(db, {
            userId,
            name: category.name,
            color: category.color,
            kind: category.kind,
          }),
        );
        existingKeys.add(key);
      }
    }

    const uniqueRows = [...currentRows, ...createdRows].filter(
      (category, index, rows) => {
        const key = `${category.kind}:${normalizeCategoryName(category.name)}`;
        return (
          rows.findIndex(
            (row) => `${row.kind}:${normalizeCategoryName(row.name)}` === key,
          ) === index
        );
      },
    );

    const items = uniqueRows.map((category) => ({
      id: category.id,
      name: category.name,
      color: category.color,
      kind: category.kind,
      icon: resolveCategoryIconKey(category),
      monthlyBudget:
        category.monthlyBudget === null ? null : Number(category.monthlyBudget),
    }));
    return jsonOk(items);
  } catch {
    return jsonError(
      "INTERNAL_ERROR",
      "Não foi possível carregar as categorias.",
      500,
    );
  }
}

// POST /api/categories — cria categoria do usuário autenticado.
export async function POST(request: Request): Promise<Response> {
  let userId: string;

  try {
    userId = await requireUserId();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return jsonError("UNAUTHORIZED", "Autenticação necessária.", 401);
    }
    throw error;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("INVALID_BODY", "Corpo da requisição inválido.", 400);
  }

  const parsed = createCategorySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      "INVALID_BODY",
      "Dados da categoria inválidos.",
      422,
      parsed.error.flatten(),
    );
  }

  try {
    const created = await createCategory(getDb(), userId, parsed.data);
    return jsonOk(created, { status: 201 });
  } catch (error) {
    if (error instanceof DuplicateCategoryError) {
      return jsonError(error.code, error.message, 409);
    }
    return jsonError(
      "INTERNAL_ERROR",
      "Não foi possível criar a categoria.",
      500,
    );
  }
}
