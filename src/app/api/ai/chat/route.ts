import { AIProviderUnavailableError } from "@/ai/provider";
import { getDb } from "@/lib/db";
import { enforceRateLimit } from "@/server/api/rate-limit";
import { jsonError } from "@/server/api/responses";
import { UnauthorizedError, requireUserId } from "@/server/auth/session";
import { streamChatResponse } from "@/server/services/ai-chat/stream-chat";
import { aiChatRequestSchema } from "@/server/validators/ai-chat";

export const runtime = "nodejs";
// Streaming com tool calling encadeado pode passar do default da Vercel.
export const maxDuration = 60;

// 30 mensagens por hora por usuário. O chat é o endpoint mais caro do produto;
// o limite protege custo e abuso sem incomodar uso normal.
const CHAT_RATE_LIMIT = { limit: 30, windowSeconds: 3_600 };

// POST /api/ai/chat — resposta em streaming do copiloto financeiro.
// O handler é fino: sessão → rate limit → validação → service. Nenhuma regra
// de negócio aqui, e nenhum dado financeiro em log.
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

  const rateLimited = await enforceRateLimit({
    scope: "ai:chat",
    identifier: userId,
    ...CHAT_RATE_LIMIT,
  });
  if (rateLimited) {
    return rateLimited;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("INVALID_BODY", "Corpo da requisição inválido.", 400);
  }

  const parsed = aiChatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      "INVALID_BODY",
      "Mensagens inválidas.",
      422,
      parsed.error.flatten(),
    );
  }

  try {
    const result = await streamChatResponse({
      db: getDb(),
      userId,
      messages: parsed.data.messages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    if (error instanceof AIProviderUnavailableError) {
      return jsonError(
        "AI_UNAVAILABLE",
        "O chat com IA ainda não está configurado neste ambiente.",
        503,
      );
    }

    // Sem detalhe do erro na resposta e sem payload no log: a mensagem do
    // usuário é dado financeiro.
    console.error("[ai:chat] falha ao iniciar o streaming");
    return jsonError(
      "INTERNAL_ERROR",
      "Não foi possível responder agora. Tente de novo.",
      500,
    );
  }
}
