import { getDb } from "@/lib/db";
import { enforceRateLimit } from "@/server/api/rate-limit";
import { jsonError } from "@/server/api/responses";
import { UnauthorizedError, requireUserId } from "@/server/auth/session";
import { UserNotFoundError } from "@/server/services/settings/errors";
import { exportUserData } from "@/server/services/settings/export-user-data";

export const runtime = "nodejs";

function exportFileName(): string {
  const today = new Date().toISOString().slice(0, 10);
  return `finsight-meus-dados-${today}.json`;
}

// POST /api/settings/export — export self-service de todos os dados do usuário.
//
// POST e não GET de propósito: um GET de dados pessoais acabaria em histórico de
// navegador, log de proxy e link compartilhável. O método também reflete o efeito
// colateral real — a exportação grava uma linha em audit_logs.
export async function POST(): Promise<Response> {
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
    scope: "settings:export",
    identifier: userId,
    limit: 3,
    windowSeconds: 60 * 60,
  });
  if (rateLimited) {
    return rateLimited;
  }

  try {
    const { data } = await exportUserData(getDb(), userId);

    return new Response(JSON.stringify(data, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${exportFileName()}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      return jsonError(error.code, error.message, 404);
    }
    return jsonError(
      "INTERNAL_ERROR",
      "Não foi possível exportar seus dados.",
      500,
    );
  }
}
