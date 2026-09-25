import { getDb } from "@/lib/db";
import { jsonError, jsonOk } from "@/server/api/responses";
import { UnauthorizedError, requireUserId } from "@/server/auth/session";
import { accountRepository } from "@/server/repositories";
import { createAccountSchema } from "@/server/validators/settings";

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

// POST /api/accounts — cria uma conta manual do usuário autenticado.
// O userId vem da sessão; nada no corpo decide de quem é a conta.
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

  const parsed = createAccountSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      "INVALID_BODY",
      "Dados da conta inválidos.",
      422,
      parsed.error.flatten(),
    );
  }

  try {
    // numeric é lido e escrito como string: converter na borda evita erro de
    // ponto flutuante no valor armazenado.
    const account = await accountRepository.create(getDb(), {
      userId,
      name: parsed.data.name,
      type: parsed.data.type,
      institution: parsed.data.institution,
      initialBalance:
        parsed.data.initialBalance === null
          ? null
          : parsed.data.initialBalance.toFixed(2),
    });

    return jsonOk(
      { id: account.id, name: account.name, type: account.type },
      { status: 201 },
    );
  } catch {
    return jsonError("INTERNAL_ERROR", "Não foi possível criar a conta.", 500);
  }
}
