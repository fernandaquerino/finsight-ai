import { getDb } from "@/lib/db";
import { enforceRateLimit } from "@/server/api/rate-limit";
import { jsonError, jsonOk } from "@/server/api/responses";
import { UnauthorizedError, requireUserId } from "@/server/auth/session";
import { deleteUserAccount } from "@/server/services/settings/delete-user-account";
import { UserNotFoundError } from "@/server/services/settings/errors";
import { deleteAccountSchema } from "@/server/validators/settings";

export const runtime = "nodejs";

// DELETE /api/settings/account — exclusão definitiva da conta (LGPD/GDPR).
//
// Exige confirmação explícita no corpo ("ENCERRAR"): é a única operação do app
// que apaga dados de verdade. Rate limited porque é irreversível.
//
// Risk — a sessão é JWT: o cookie continua criptograficamente válido até expirar,
// mesmo sem o usuário no banco. Os dados já não existem e toda query filtra por
// userId (resultado vazio), mas o cliente deve forçar logout imediatamente após
// esta resposta — é o que o DeleteAccountDialog faz, postando em /logout.
export async function DELETE(request: Request): Promise<Response> {
  let userId: string;

  try {
    userId = await requireUserId();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return jsonError("UNAUTHORIZED", "Autenticação necessária.", 401);
    }
    throw error;
  }

  const rateLimited = await enforceRateLimit({
    scope: "settings:account-delete",
    identifier: userId,
    limit: 3,
    windowSeconds: 60 * 60,
  });
  if (rateLimited) {
    return rateLimited;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("INVALID_BODY", "Corpo da requisição inválido.", 400);
  }

  const parsed = deleteAccountSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      "INVALID_BODY",
      "Confirmação inválida.",
      422,
      parsed.error.flatten(),
    );
  }

  try {
    const deleted = await deleteUserAccount(getDb(), userId);
    return jsonOk(deleted);
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      return jsonError(error.code, error.message, 404);
    }
    return jsonError(
      "INTERNAL_ERROR",
      "Não foi possível encerrar a conta.",
      500,
    );
  }
}
