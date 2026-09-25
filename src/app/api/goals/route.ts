import { getDb } from "@/lib/db";
import { jsonError, jsonOk } from "@/server/api/responses";
import { UnauthorizedError, requireUserId } from "@/server/auth/session";
import { getGoalsSummary } from "@/server/services/goals/summary";
import { createGoal } from "@/server/services/goals/mutate";
import { createGoalSchema } from "@/server/validators/goals";

export const runtime = "nodejs";

// GET /api/goals — metas do usuário com progresso e projeção determinística.
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
    const summary = await getGoalsSummary(getDb(), userId);
    return jsonOk(summary);
  } catch {
    return jsonError(
      "INTERNAL_ERROR",
      "Não foi possível carregar as metas.",
      500,
    );
  }
}

// POST /api/goals — cria meta do usuário autenticado.
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

  const parsed = createGoalSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      "INVALID_BODY",
      "Dados da meta inválidos.",
      422,
      parsed.error.flatten(),
    );
  }

  try {
    const created = await createGoal(getDb(), userId, parsed.data);
    return jsonOk(created, { status: 201 });
  } catch {
    return jsonError("INTERNAL_ERROR", "Não foi possível criar a meta.", 500);
  }
}
