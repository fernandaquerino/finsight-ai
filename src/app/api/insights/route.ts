import { getDb } from "@/lib/db";
import { jsonError, jsonOk } from "@/server/api/responses";
import { UnauthorizedError, requireUserId } from "@/server/auth/session";
import { getInsightsSummary } from "@/server/services/insights/summary";
import { insightsQuerySchema } from "@/server/validators/insights";

export const runtime = "nodejs";

// GET /api/insights?month=YYYY-MM — insights determinísticos derivados dos
// dados do usuário. Isolado por userId (repositórios e services filtram).
// Nenhuma escrita: a IA observa e propõe, o usuário age na tela do domínio.
export async function GET(request: Request): Promise<Response> {
  let userId: string;

  try {
    userId = await requireUserId();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return jsonError("UNAUTHORIZED", "Autenticação necessária.", 401);
    }
    throw error;
  }

  const { searchParams } = new URL(request.url);
  const parsed = insightsQuerySchema.safeParse({
    month: searchParams.get("month") ?? undefined,
  });

  if (!parsed.success) {
    return jsonError(
      "INVALID_QUERY",
      "Parâmetros de consulta inválidos.",
      422,
      parsed.error.flatten(),
    );
  }

  try {
    const summary = await getInsightsSummary(
      getDb(),
      userId,
      parsed.data.month,
    );
    return jsonOk(summary);
  } catch {
    return jsonError(
      "INTERNAL_ERROR",
      "Não foi possível carregar os insights.",
      500,
    );
  }
}
