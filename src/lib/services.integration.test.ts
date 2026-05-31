// @vitest-environment node
import { createClient } from "redis";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Pool } from "pg";

const databaseUrl = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
const redisUrl = process.env.TEST_REDIS_URL ?? process.env.REDIS_URL;
const shouldRunIntegrationTests =
  Boolean(process.env.CI) ||
  process.env.RUN_INTEGRATION_TESTS === "1" ||
  Boolean(process.env.TEST_DATABASE_URL && process.env.TEST_REDIS_URL);

const describeIntegration = shouldRunIntegrationTests
  ? describe
  : describe.skip;

describeIntegration("local services", () => {
  let pool: Pool;
  let redis: ReturnType<typeof createClient>;

  beforeAll(async () => {
    if (!databaseUrl || !redisUrl) {
      throw new Error(
        "Set TEST_DATABASE_URL and TEST_REDIS_URL to run integration tests.",
      );
    }

    pool = new Pool({ connectionString: databaseUrl });
    redis = createClient({ url: redisUrl });

    await redis.connect();
  });

  afterAll(async () => {
    if (redis?.isOpen) {
      await redis.quit();
    }

    await pool?.end();
  });

  it("connects to Postgres with pgvector enabled", async () => {
    await pool.query("CREATE EXTENSION IF NOT EXISTS vector");

    const result = await pool.query<{ extname: string }>(
      "SELECT extname FROM pg_extension WHERE extname = 'vector'",
    );

    expect(result.rows[0]?.extname).toBe("vector");
  });

  it("connects to Redis and reads a value back", async () => {
    const key = "finsight:test:redis";

    await redis.set(key, "ok", { EX: 30 });

    await expect(redis.get(key)).resolves.toBe("ok");
  });
});
