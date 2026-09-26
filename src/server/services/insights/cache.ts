import { getRedisClient } from "@/lib/redis";

// Os insights são derivados: recalculá-los varre até 6 meses de transações,
// categorias, metas e orçamentos. O layout autenticado lê esse resumo em toda
// página (indicador da sidebar + notificações), então o cache aqui não é
// otimização opcional — é o que mantém a navegação barata.
const TTL_SECONDS = 120;
const KEY_PREFIX = "insights:summary";

export function insightsCacheKey(userId: string, monthKey: string): string {
  return `${KEY_PREFIX}:${userId}:${monthKey}`;
}

// Mesma política do cache do dashboard: falha de Redis é cache-miss, nunca
// erro visível. O banco é a fonte da verdade.
export async function getCachedInsights<T>(key: string): Promise<T | null> {
  try {
    const redis = await getRedisClient();
    const raw = await redis.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function setCachedInsights(
  key: string,
  value: unknown,
): Promise<void> {
  try {
    const redis = await getRedisClient();
    await redis.set(key, JSON.stringify(value), { EX: TTL_SECONDS });
  } catch {
    // no-op: segue sem cache.
  }
}

// Invalida todos os meses do usuário. Chamado junto da invalidação do
// dashboard, porque as mesmas mutações (transação, categoria, meta) mudam os
// insights.
export async function invalidateInsightsCache(userId: string): Promise<void> {
  try {
    const redis = await getRedisClient();
    const pattern = `${KEY_PREFIX}:${userId}:*`;
    const keys: string[] = [];

    for await (const key of redis.scanIterator({ MATCH: pattern })) {
      keys.push(...(Array.isArray(key) ? key : [key]));
    }

    if (keys.length > 0) {
      await redis.del(keys);
    }
  } catch {
    // no-op.
  }
}
