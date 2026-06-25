import { getDb } from "@/lib/db";
import { jsonError, jsonOk } from "@/server/api/responses";
import { UnauthorizedError, requireUserId } from "@/server/auth/session";
import { listTransactions } from "@/server/services/transactions/list";
import { transactionsQuerySchema } from "@/server/validators/transactions";

export const runtime = "nodejs";

// GET /api/transactions?from=YYYY-MM-DD&to=YYYY-MM-DD&categoryId=&accountId=&kind=&search=&page=&limit=
// userId vem sempre da sessão do servidor; nunca do cliente.
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
  const parsed = transactionsQuerySchema.safeParse({
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
    categoryId: searchParams.get("categoryId") ?? undefined,
    accountId: searchParams.get("accountId") ?? undefined,
    kind: searchParams.get("kind") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
  });

  if (!parsed.success) {
    return jsonError(
      "INVALID_QUERY",
      "Parâmetros de transações inválidos.",
      422,
      parsed.error.flatten(),
    );
  }

  try {
    const result = await listTransactions(getDb(), userId, parsed.data);
    return jsonOk(result);
  } catch {
    return jsonError(
      "INTERNAL_ERROR",
      "Não foi possível carregar as transações.",
      500,
    );
  }
}
