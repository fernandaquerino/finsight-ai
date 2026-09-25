import { getDb } from "@/lib/db";
import { jsonError, jsonOk } from "@/server/api/responses";
import { UnauthorizedError, requireUserId } from "@/server/auth/session";
import { getReport } from "@/server/services/reports/get-report";
import { resolveReportPeriod } from "@/server/services/reports/period";
import { reportQuerySchema } from "@/server/validators/reports";

export const runtime = "nodejs";

// GET /api/reports?granularity=monthly|quarterly|yearly&month=YYYY-MM
// Sem month → período ancorado no mês corrente. userId vem sempre da sessão.
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
  const parsed = reportQuerySchema.safeParse({
    granularity: searchParams.get("granularity") ?? undefined,
    month: searchParams.get("month") ?? undefined,
  });

  if (!parsed.success) {
    return jsonError(
      "INVALID_QUERY",
      "Parâmetros do relatório inválidos.",
      422,
      parsed.error.flatten(),
    );
  }

  try {
    const period = resolveReportPeriod(
      parsed.data.granularity,
      parsed.data.month,
    );
    const report = await getReport(getDb(), userId, period);
    return jsonOk(report);
  } catch {
    return jsonError(
      "INTERNAL_ERROR",
      "Não foi possível gerar o relatório.",
      500,
    );
  }
}
