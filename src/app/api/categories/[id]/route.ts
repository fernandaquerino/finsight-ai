import { getDb } from "@/lib/db";
import { jsonError, jsonOk } from "@/server/api/responses";
import { UnauthorizedError, requireUserId } from "@/server/auth/session";
import {
  DuplicateCategoryError,
  ProtectedCategoryError,
  deleteCategory,
  updateCategory,
} from "@/server/services/categories/mutate";
import { updateCategorySchema } from "@/server/validators/categories";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function resolveUserId(): Promise<
  { userId: string } | { response: Response }
> {
  try {
    return { userId: await requireUserId() };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return {
        response: jsonError("UNAUTHORIZED", "Autenticação necessária.", 401),
      };
    }
    throw error;
  }
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// PATCH /api/categories/:id — edita nome, cor, ícone ou orçamento.
export async function PATCH(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const auth = await resolveUserId();
  if ("response" in auth) {
    return auth.response;
  }

  const { id } = await context.params;
  if (!UUID_PATTERN.test(id)) {
    return jsonError("INVALID_ID", "Identificador inválido.", 400);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("INVALID_BODY", "Corpo da requisição inválido.", 400);
  }

  const parsed = updateCategorySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      "INVALID_BODY",
      "Dados da categoria inválidos.",
      422,
      parsed.error.flatten(),
    );
  }

  try {
    const updated = await updateCategory(getDb(), auth.userId, id, parsed.data);

    if (!updated) {
      return jsonError("NOT_FOUND", "Categoria não encontrada.", 404);
    }

    return jsonOk(updated);
  } catch (error) {
    if (error instanceof DuplicateCategoryError) {
      return jsonError(error.code, error.message, 409);
    }
    if (error instanceof ProtectedCategoryError) {
      return jsonError(error.code, error.message, 409);
    }
    return jsonError(
      "INTERNAL_ERROR",
      "Não foi possível atualizar a categoria.",
      500,
    );
  }
}

// DELETE /api/categories/:id — move as transações para "Outros" e remove.
export async function DELETE(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  const auth = await resolveUserId();
  if ("response" in auth) {
    return auth.response;
  }

  const { id } = await context.params;
  if (!UUID_PATTERN.test(id)) {
    return jsonError("INVALID_ID", "Identificador inválido.", 400);
  }

  try {
    const deleted = await deleteCategory(getDb(), auth.userId, id);

    if (!deleted) {
      return jsonError("NOT_FOUND", "Categoria não encontrada.", 404);
    }

    return jsonOk(deleted);
  } catch (error) {
    if (error instanceof ProtectedCategoryError) {
      return jsonError(error.code, error.message, 409);
    }
    return jsonError(
      "INTERNAL_ERROR",
      "Não foi possível excluir a categoria.",
      500,
    );
  }
}
