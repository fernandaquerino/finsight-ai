import { getDb } from "@/lib/db";
import { jsonError, jsonOk } from "@/server/api/responses";
import { UnauthorizedError, requireUserId } from "@/server/auth/session";
import { getDashboardSummary } from "@/server/services/dashboard/get-dashboard-summary";
import { resolvePeriod } from "@/server/services/dashboard/period";
import { dashboardQuerySchema } from "@/server/validators/dashboard";

export const runtime = "nodejs";

// GET /api/dashboard?from=YYYY-MM-DD&to=YYYY-MM-DD
// Sem from/to → mês corrente. userId vem sempre da sessão (nunca do cliente).
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
  const parsed = dashboardQuerySchema.safeParse({
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
  });

  if (!parsed.success) {
    return jsonError(
      "INVALID_QUERY",
      "Parâmetros de período inválidos.",
      422,
      parsed.error.flatten(),
    );
  }

  try {
    const period = resolvePeriod(parsed.data);
    const summary = await getDashboardSummary(getDb(), userId, period);
    return jsonOk(summary);
  } catch {
    return jsonError(
      "INTERNAL_ERROR",
      "Não foi possível carregar o dashboard.",
      500,
    );
  }
}
