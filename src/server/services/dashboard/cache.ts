import { getRedisClient } from "@/lib/redis";

// Cache de leitura do dashboard. TTL curto: os dados mudam quando o usuário
// cria/edita/remove transações; o TTL é a rede de segurança e a invalidação
// explícita (invalidateDashboardCache) é o caminho principal.
const TTL_SECONDS = 60;
const KEY_PREFIX = "dashboard:summary";

export function dashboardCacheKey(userId: string, periodKey: string): string {
  return `${KEY_PREFIX}:${userId}:${periodKey}`;
}

// Falhas de Redis nunca devem derrubar o dashboard: em erro, tratamos como
// cache-miss (get → null) ou no-op (set/invalidate). O banco é a fonte da verdade.
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const redis = await getRedisClient();
    const raw = await redis.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function setCached(key: string, value: unknown): Promise<void> {
  try {
    const redis = await getRedisClient();
    await redis.set(key, JSON.stringify(value), { EX: TTL_SECONDS });
  } catch {
    // no-op: segue sem cache.
  }
}

// Invalida todas as entradas de dashboard do usuário (todos os períodos).
// Chamado após qualquer mutação de transação.
export async function invalidateDashboardCache(userId: string): Promise<void> {
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
