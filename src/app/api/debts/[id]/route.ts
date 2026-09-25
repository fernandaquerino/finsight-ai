import { getDb } from "@/lib/db";
import { jsonError, jsonOk } from "@/server/api/responses";
import { UnauthorizedError, requireUserId } from "@/server/auth/session";
import {
  DebtNotFoundError,
  InvalidDebtBalanceError,
  deleteDebt,
  updateDebt,
} from "@/server/services/debts/mutate";
import { updateDebtSchema } from "@/server/validators/debts";

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

// PATCH /api/debts/:id — edita descrição, tipo, saldos, parcela, taxa ou dia.
export async function PATCH(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const auth = await resolveUserId();
  if ("response" in auth) return auth.response;

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

  const parsed = updateDebtSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      "INVALID_BODY",
      "Dados da dívida inválidos.",
      422,
      parsed.error.flatten(),
    );
  }

  try {
    const updated = await updateDebt(getDb(), auth.userId, id, parsed.data);
    return jsonOk(updated);
  } catch (error) {
    if (error instanceof DebtNotFoundError) {
      return jsonError(error.code, error.message, 404);
    }
    if (error instanceof InvalidDebtBalanceError) {
      return jsonError(error.code, error.message, 422);
    }
    return jsonError(
      "INTERNAL_ERROR",
      "Não foi possível atualizar a dívida.",
      500,
    );
  }
}

// DELETE /api/debts/:id — soft delete (preserva auditoria).
export async function DELETE(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  const auth = await resolveUserId();
  if ("response" in auth) return auth.response;

  const { id } = await context.params;
  if (!UUID_PATTERN.test(id)) {
    return jsonError("INVALID_ID", "Identificador inválido.", 400);
  }

  try {
    const deleted = await deleteDebt(getDb(), auth.userId, id);
    return jsonOk(deleted);
  } catch (error) {
    if (error instanceof DebtNotFoundError) {
      return jsonError(error.code, error.message, 404);
    }
    return jsonError(
      "INTERNAL_ERROR",
      "Não foi possível excluir a dívida.",
      500,
    );
  }
}
