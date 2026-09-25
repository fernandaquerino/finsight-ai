import { getRedisClient } from "@/lib/redis";

import { jsonError } from "./responses";

export type RateLimitRule = {
  // Identificador do escopo (ex.: "settings:password"). Compõe a chave no Redis.
  scope: string;
  // Identidade do chamador — sempre o userId da sessão, nunca algo do cliente.
  identifier: string;
  limit: number;
  windowSeconds: number;
};

// Rate limit por janela fixa: INCR + EXPIRE na primeira ocorrência. Simples o
// bastante para endpoints sensíveis de baixa frequência (troca de senha, export,
// exclusão de conta). `Future` — janela deslizante se algum endpoint de alto
// volume precisar de precisão nas bordas.
//
// Decisão: FAIL OPEN se o Redis estiver indisponível. A requisição segue (a
// autenticação continua exigida) em vez de trancar o usuário fora da própria
// conta por causa de uma queda de cache. O trade-off é aceitar que, durante uma
// indisponibilidade do Redis, o limite não é aplicado.
export async function checkRateLimit(
  rule: RateLimitRule,
): Promise<{ allowed: true } | { allowed: false; retryAfterSeconds: number }> {
  try {
    const redis = await getRedisClient();
    const key = `ratelimit:${rule.scope}:${rule.identifier}`;
    const count = await redis.incr(key);

    if (count === 1) {
      await redis.expire(key, rule.windowSeconds);
    }

    if (count <= rule.limit) {
      return { allowed: true };
    }

    const ttl = await redis.ttl(key);

    return {
      allowed: false,
      retryAfterSeconds: ttl > 0 ? ttl : rule.windowSeconds,
    };
  } catch {
    // Sem log do identifier: é o userId, e logs não carregam identificação
    // direta do usuário.
    console.warn(`[rate-limit] indisponível para o escopo ${rule.scope}`);
    return { allowed: true };
  }
}

// Atalho para route handlers: devolve a Response 429 pronta, ou null se passou.
export async function enforceRateLimit(
  rule: RateLimitRule,
): Promise<Response | null> {
  const result = await checkRateLimit(rule);

  if (result.allowed) {
    return null;
  }

  const response = jsonError(
    "RATE_LIMITED",
    "Muitas tentativas. Tente novamente em instantes.",
    429,
  );
  response.headers.set("Retry-After", String(result.retryAfterSeconds));

  return response;
}
