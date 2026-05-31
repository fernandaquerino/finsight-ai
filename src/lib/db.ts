import { Pool } from "pg";

import { getEnv } from "@/lib/env";

const globalForPostgres = globalThis as unknown as {
  postgresPool?: Pool;
};

export function getPostgresPool(): Pool {
  if (!globalForPostgres.postgresPool) {
    globalForPostgres.postgresPool = new Pool({
      connectionString: getEnv("DATABASE_URL"),
    });
  }

  return globalForPostgres.postgresPool;
}
