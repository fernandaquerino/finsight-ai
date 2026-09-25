import { getDb } from "@/lib/db";
import { jsonError, jsonOk } from "@/server/api/responses";
import { UnauthorizedError, requireUserId } from "@/server/auth/session";
import {
  CategoryNotFoundError,
  updateCategoryBudgets,
} from "@/server/services/categories/mutate";
import { updateCategoryBudgetsSchema } from "@/server/validators/categories";

export const runtime = "nodejs";

// PATCH /api/categories/budgets — edita os limites mensais em lote.
// Segmento estático: tem precedência sobre /api/categories/[id].
export async function PATCH(request: Request): Promise<Response> {
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

  const parsed = updateCategoryBudgetsSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      "INVALID_BODY",
      "Limites inválidos.",
      422,
      parsed.error.flatten(),
    );
  }

  try {
    const updated = await updateCategoryBudgets(
      getDb(),
      userId,
      parsed.data.budgets,
    );

    return jsonOk({ updated: updated.length });
  } catch (error) {
    if (error instanceof CategoryNotFoundError) {
      return jsonError(error.code, error.message, 404);
    }
    return jsonError(
      "INTERNAL_ERROR",
      "Não foi possível atualizar os limites.",
      500,
    );
  }
}
