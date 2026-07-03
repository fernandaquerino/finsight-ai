import { getDb } from "@/lib/db";
import { jsonError, jsonOk } from "@/server/api/responses";
import { UnauthorizedError, requireUserId } from "@/server/auth/session";
import { listTransactions } from "@/server/services/transactions/list";
import {
  DuplicateTransactionError,
  TransactionOwnershipError,
  createTransaction,
} from "@/server/services/transactions/mutate";
import {
  createTransactionSchema,
  transactionsQuerySchema,
} from "@/server/validators/transactions";

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
    origin: searchParams.get("origin") ?? undefined,
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

// POST /api/transactions — cria uma transação manual.
// userId vem sempre da sessão; accountId/categoryId são validados como
// pertencentes ao usuário na camada de service.
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("INVALID_BODY", "Corpo da requisição inválido.", 400);
  }

  const parsed = createTransactionSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      "INVALID_BODY",
      "Dados da transação inválidos.",
      422,
      parsed.error.flatten(),
    );
  }

  try {
    const created = await createTransaction(getDb(), userId, parsed.data);
    return jsonOk(created, { status: 201 });
  } catch (error) {
    if (error instanceof TransactionOwnershipError) {
      return jsonError(error.code, error.message, 422);
    }
    if (error instanceof DuplicateTransactionError) {
      return jsonError(error.code, error.message, 409);
    }
    return jsonError(
      "INTERNAL_ERROR",
      "Não foi possível criar a transação.",
      500,
    );
  }
}
