import { getDb } from "@/lib/db";
import { enforceRateLimit } from "@/server/api/rate-limit";
import { jsonError, jsonOk } from "@/server/api/responses";
import { UnauthorizedError, requireUserId } from "@/server/auth/session";
import { changePassword } from "@/server/services/settings/change-password";
import {
  InvalidCurrentPasswordError,
  PasswordNotSetError,
  UserNotFoundError,
} from "@/server/services/settings/errors";
import { changePasswordSchema } from "@/server/validators/settings";

export const runtime = "nodejs";

// POST /api/settings/password — troca a senha do usuário autenticado.
//
// Endpoint sensível: rate limited (5 tentativas a cada 15 min por usuário) para
// que uma sessão sequestrada não possa forçar a senha atual por tentativa e erro.
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

  const rateLimited = await enforceRateLimit({
    scope: "settings:password",
    identifier: userId,
    limit: 5,
    windowSeconds: 15 * 60,
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

  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    // details nunca ecoa os valores enviados — apenas o mapa de mensagens.
    return jsonError(
      "INVALID_BODY",
      "Dados inválidos.",
      422,
      parsed.error.flatten(),
    );
  }

  try {
    const result = await changePassword(getDb(), userId, parsed.data);
    return jsonOk(result);
  } catch (error) {
    if (error instanceof InvalidCurrentPasswordError) {
      return jsonError(error.code, error.message, 422);
    }
    if (error instanceof PasswordNotSetError) {
      return jsonError(error.code, error.message, 409);
    }
    if (error instanceof UserNotFoundError) {
      return jsonError(error.code, error.message, 404);
    }
    return jsonError(
      "INTERNAL_ERROR",
      "Não foi possível alterar a senha.",
      500,
    );
  }
}
