import { getDb } from "@/lib/db";
import { jsonError, jsonOk } from "@/server/api/responses";
import { UnauthorizedError, requireUserId } from "@/server/auth/session";
import { createDebt } from "@/server/services/debts/mutate";
import { getDebtsSummary } from "@/server/services/debts/summary";
import {
  createDebtSchema,
  debtsSummaryQuerySchema,
} from "@/server/validators/debts";

export const runtime = "nodejs";

// GET /api/debts?strategy=avalanche|snowball&extraMonthly=0
// Dívidas do usuário ordenadas pela estratégia, com simulação de quitação.
// Isolado por userId (repository filtra).
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
  const parsed = debtsSummaryQuerySchema.safeParse({
    strategy: searchParams.get("strategy") ?? undefined,
    extraMonthly: searchParams.get("extraMonthly") ?? undefined,
  });

  if (!parsed.success) {
    return jsonError(
      "INVALID_QUERY",
      "Parâmetros da estratégia inválidos.",
      422,
      parsed.error.flatten(),
    );
  }

  try {
    const summary = await getDebtsSummary(
      getDb(),
      userId,
      parsed.data.strategy,
      parsed.data.extraMonthly,
    );
    return jsonOk(summary);
  } catch {
    return jsonError(
      "INTERNAL_ERROR",
      "Não foi possível carregar as dívidas.",
      500,
    );
  }
}

// POST /api/debts — cria dívida do usuário autenticado.
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

  const parsed = createDebtSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      "INVALID_BODY",
      "Dados da dívida inválidos.",
      422,
      parsed.error.flatten(),
    );
  }

  try {
    const created = await createDebt(getDb(), userId, parsed.data);
    return jsonOk(created, { status: 201 });
  } catch {
    return jsonError("INTERNAL_ERROR", "Não foi possível criar a dívida.", 500);
  }
}
