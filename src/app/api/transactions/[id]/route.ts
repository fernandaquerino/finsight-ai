import { getDb } from "@/lib/db";
import { jsonError, jsonOk } from "@/server/api/responses";
import { UnauthorizedError, requireUserId } from "@/server/auth/session";
import { getTransaction } from "@/server/services/transactions/list";
import {
  DuplicateTransactionError,
  TransactionOwnershipError,
  deleteTransaction,
  updateTransaction,
} from "@/server/services/transactions/mutate";
import { updateTransactionSchema } from "@/server/validators/transactions";

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

// GET /api/transactions/:id — leitura de uma transação (preenche o form de
// edição). Isolada por userId.
export async function GET(
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
    const transaction = await getTransaction(getDb(), auth.userId, id);
    if (!transaction) {
      return jsonError("NOT_FOUND", "Transação não encontrada.", 404);
    }
    return jsonOk(transaction);
  } catch {
    return jsonError(
      "INTERNAL_ERROR",
      "Não foi possível carregar a transação.",
      500,
    );
  }
}

// PATCH /api/transactions/:id — recategoriza ou edita campos da transação.
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

  const parsed = updateTransactionSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      "INVALID_BODY",
      "Dados da transação inválidos.",
      422,
      parsed.error.flatten(),
    );
  }

  try {
    const updated = await updateTransaction(
      getDb(),
      auth.userId,
      id,
      parsed.data,
    );

    if (!updated) {
      return jsonError("NOT_FOUND", "Transação não encontrada.", 404);
    }

    return jsonOk(updated);
  } catch (error) {
    if (error instanceof TransactionOwnershipError) {
      return jsonError(error.code, error.message, 422);
    }
    if (error instanceof DuplicateTransactionError) {
      return jsonError(error.code, error.message, 409);
    }
    return jsonError(
      "INTERNAL_ERROR",
      "Não foi possível atualizar a transação.",
      500,
    );
  }
}

// DELETE /api/transactions/:id — soft delete (mantém auditoria).
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
    const deleted = await deleteTransaction(getDb(), auth.userId, id);

    if (!deleted) {
      return jsonError("NOT_FOUND", "Transação não encontrada.", 404);
    }

    return jsonOk({ id: deleted.id });
  } catch {
    return jsonError(
      "INTERNAL_ERROR",
      "Não foi possível excluir a transação.",
      500,
    );
  }
}
