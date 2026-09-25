import { getDb } from "@/lib/db";
import { jsonError, jsonOk } from "@/server/api/responses";
import { UnauthorizedError, requireUserId } from "@/server/auth/session";
import {
  AccountHasTransactionsError,
  AccountNotFoundError,
  deleteAccount,
} from "@/server/services/accounts/delete-account";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// DELETE /api/accounts/:id — soft delete da conta do usuário autenticado.
// O id do cliente não autoriza nada: o service filtra por userId.
export async function DELETE(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  let userId: string;

  try {
    userId = await requireUserId();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return jsonError("UNAUTHORIZED", "Autenticação necessária.", 401);
    }
    throw error;
  }

  const { id } = await context.params;

  if (!UUID_PATTERN.test(id)) {
    return jsonError("INVALID_ID", "Identificador inválido.", 422);
  }

  try {
    const deleted = await deleteAccount(getDb(), userId, id);
    return jsonOk(deleted);
  } catch (error) {
    if (error instanceof AccountNotFoundError) {
      return jsonError(error.code, error.message, 404);
    }
    if (error instanceof AccountHasTransactionsError) {
      return jsonError(error.code, error.message, 409);
    }
    return jsonError(
      "INTERNAL_ERROR",
      "Não foi possível remover a conta.",
      500,
    );
  }
}
