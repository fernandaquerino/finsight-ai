import { getDb } from "@/lib/db";
import { jsonError, jsonOk } from "@/server/api/responses";
import { UnauthorizedError, requireUserId } from "@/server/auth/session";
import { getCategoriesSummary } from "@/server/services/categories/summary";
import { categoriesSummaryQuerySchema } from "@/server/validators/categories";

export const runtime = "nodejs";

// GET /api/categories/summary?month=YYYY-MM — categorias com total do mês e
// uso do orçamento. Isolado por userId (repositories filtram).
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

  const searchParams = new URL(request.url).searchParams;
  const parsed = categoriesSummaryQuerySchema.safeParse({
    month: searchParams.get("month") ?? undefined,
  });

  if (!parsed.success) {
    return jsonError(
      "INVALID_QUERY",
      "Parâmetros inválidos.",
      422,
      parsed.error.flatten(),
    );
  }

  try {
    const summary = await getCategoriesSummary(
      getDb(),
      userId,
      parsed.data.month,
    );
    return jsonOk(summary);
  } catch {
    return jsonError(
      "INTERNAL_ERROR",
      "Não foi possível carregar o resumo de categorias.",
      500,
    );
  }
}
