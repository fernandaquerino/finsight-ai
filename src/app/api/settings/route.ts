import { getDb } from "@/lib/db";
import { jsonError, jsonOk } from "@/server/api/responses";
import { UnauthorizedError, requireUserId } from "@/server/auth/session";
import { UserNotFoundError } from "@/server/services/settings/errors";
import { getSettings } from "@/server/services/settings/get-settings";
import { updateSettings } from "@/server/services/settings/update-settings";
import { updateSettingsSchema } from "@/server/validators/settings";

export const runtime = "nodejs";

// GET /api/settings — dados pessoais, preferências de IA/notificação e contas
// do usuário autenticado. O CPF sai apenas mascarado (ver services/settings/mask).
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
    const settings = await getSettings(getDb(), userId);
    return jsonOk(settings, {
      // Dados pessoais: nunca em cache compartilhado.
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      return jsonError(error.code, error.message, 404);
    }
    return jsonError(
      "INTERNAL_ERROR",
      "Não foi possível carregar as configurações.",
      500,
    );
  }
}

// PATCH /api/settings — patch parcial de dados pessoais e preferências.
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

  const parsed = updateSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      "INVALID_BODY",
      "Dados inválidos.",
      422,
      parsed.error.flatten(),
    );
  }

  try {
    const updated = await updateSettings(getDb(), userId, parsed.data);
    return jsonOk(updated);
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      return jsonError(error.code, error.message, 404);
    }
    return jsonError(
      "INTERNAL_ERROR",
      "Não foi possível salvar as configurações.",
      500,
    );
  }
}
