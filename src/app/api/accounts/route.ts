import { getDb } from "@/lib/db";
import { jsonError, jsonOk } from "@/server/api/responses";
import { UnauthorizedError, requireUserId } from "@/server/auth/session";
import { accountRepository } from "@/server/repositories";

export const runtime = "nodejs";

// GET /api/accounts — contas do usuário autenticado, para popular selects.
// Isolado por userId (repository filtra) e sem soft-deleted.
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
    const rows = await accountRepository.listByUser(getDb(), userId);
    const items = rows.map((account) => ({
      id: account.id,
      name: account.name,
      type: account.type,
    }));
    return jsonOk(items);
  } catch {
    return jsonError(
      "INTERNAL_ERROR",
      "Não foi possível carregar as contas.",
      500,
    );
  }
}
