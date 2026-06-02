import { Pool } from "pg";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";

import * as schema from "../../db/schema";
import { getEnv } from "@/lib/env";

const globalForPostgres = globalThis as unknown as {
  postgresPool?: Pool;
  db?: NodePgDatabase<typeof schema>;
};

export function getPostgresPool(): Pool {
  if (!globalForPostgres.postgresPool) {
    globalForPostgres.postgresPool = new Pool({
      connectionString: getEnv("DATABASE_URL"),
    });
  }

  return globalForPostgres.postgresPool;
}

export function getDb(): NodePgDatabase<typeof schema> {
  if (!globalForPostgres.db) {
    globalForPostgres.db = drizzle(getPostgresPool(), { schema });
  }

  return globalForPostgres.db;
}
