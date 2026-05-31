import { getPostgresPool } from "@/lib/db";
import { getRedisClient } from "@/lib/redis";

export const runtime = "nodejs";

type ServiceStatus = "ok" | "error";

type HealthResponse = {
  status: ServiceStatus;
  services: {
    postgres: ServiceStatus;
    redis: ServiceStatus;
  };
};

async function checkPostgres(): Promise<ServiceStatus> {
  const pool = getPostgresPool();
  await pool.query("SELECT 1");

  return "ok";
}

async function checkRedis(): Promise<ServiceStatus> {
  const redis = await getRedisClient();
  await redis.ping();

  return "ok";
}

export async function GET() {
  const results = await Promise.allSettled([checkPostgres(), checkRedis()]);

  const response: HealthResponse = {
    status: results.every((result) => result.status === "fulfilled")
      ? "ok"
      : "error",
    services: {
      postgres: results[0].status === "fulfilled" ? "ok" : "error",
      redis: results[1].status === "fulfilled" ? "ok" : "error",
    },
  };

  return Response.json(response, {
    status: response.status === "ok" ? 200 : 503,
  });
}
