import { createClient, type RedisClientType } from "redis";

import { getEnv } from "@/lib/env";

const globalForRedis = globalThis as unknown as {
  redisClient?: RedisClientType;
};

export async function getRedisClient(): Promise<RedisClientType> {
  if (!globalForRedis.redisClient) {
    globalForRedis.redisClient = createClient({
      url: getEnv("REDIS_URL"),
    });
  }

  if (!globalForRedis.redisClient.isOpen) {
    await globalForRedis.redisClient.connect();
  }

  return globalForRedis.redisClient;
}
