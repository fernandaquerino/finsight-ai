// @vitest-environment node
import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Pool } from "pg";

import * as schema from "@/../db/schema";

import { accountRepository } from "./accounts";
import { categoryRepository } from "./categories";
import { transactionRepository } from "./transactions";

const databaseUrl = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
const shouldRunIntegrationTests =
  Boolean(process.env.CI) ||
  process.env.RUN_INTEGRATION_TESTS === "1" ||
  Boolean(process.env.TEST_DATABASE_URL);

const describeIntegration = shouldRunIntegrationTests
  ? describe
  : describe.skip;

describeIntegration("repository userId isolation", () => {
  let pool: Pool;
  let db: NodePgDatabase<typeof schema>;

  // Dois usuários fictícios criados só para este teste; limpos no afterAll.
  const userAId = randomUUID();
  const userBId = randomUUID();
  let accountBId: string;
  let categoryBId: string;
  let transactionBId: string;

  beforeAll(async () => {
    if (!databaseUrl) {
      throw new Error("Set TEST_DATABASE_URL to run integration tests.");
    }

    pool = new Pool({ connectionString: databaseUrl });
    db = drizzle(pool, { schema });

    await db.insert(schema.users).values([
      { id: userAId, email: `iso-a-${userAId}@finsight.local` },
      { id: userBId, email: `iso-b-${userBId}@finsight.local` },
    ]);

    // Recursos do usuário A.
    await accountRepository.create(db, {
      userId: userAId,
      name: "Conta A",
      type: "checking",
    });

    // Recursos do usuário B (o "alvo" que A não pode acessar).
    const accountB = await accountRepository.create(db, {
      userId: userBId,
      name: "Conta B",
      type: "checking",
    });
    const categoryB = await categoryRepository.create(db, {
      userId: userBId,
      name: "Categoria B",
      color: "#000000",
      kind: "expense",
    });
    const transactionB = await transactionRepository.create(db, {
      userId: userBId,
      accountId: accountB.id,
      amount: "100.00",
      kind: "expense",
      occurredAt: new Date(),
      origin: "manual",
      dedupeHash: randomUUID(),
    });

    accountBId = accountB.id;
    categoryBId = categoryB.id;
    transactionBId = transactionB.id;
  });

  afterAll(async () => {
    // Cascade remove contas, categorias e transações dos dois usuários.
    if (db) {
      await db.delete(schema.users).where(eq(schema.users.id, userAId));
      await db.delete(schema.users).where(eq(schema.users.id, userBId));
    }
    await pool?.end();
  });

  it("listByUser returns only the requester's accounts", async () => {
    const accountsA = await accountRepository.listByUser(db, userAId);
    const accountsB = await accountRepository.listByUser(db, userBId);

    expect(accountsA).toHaveLength(1);
    expect(accountsA[0]?.name).toBe("Conta A");
    expect(accountsB.every((account) => account.userId === userBId)).toBe(true);
  });

  it("findById denies access to another user's account", async () => {
    const leaked = await accountRepository.findById(db, userAId, accountBId);
    expect(leaked).toBeUndefined();
  });

  it("findById denies access to another user's category", async () => {
    const leaked = await categoryRepository.findById(db, userAId, categoryBId);
    expect(leaked).toBeUndefined();
  });

  it("findById denies access to another user's transaction", async () => {
    const leaked = await transactionRepository.findById(
      db,
      userAId,
      transactionBId,
    );
    expect(leaked).toBeUndefined();
  });

  it("softDelete does not affect another user's account", async () => {
    const result = await accountRepository.softDelete(db, userAId, accountBId);
    expect(result).toBeUndefined();

    // Conta de B continua acessível por B.
    const stillThere = await accountRepository.findById(
      db,
      userBId,
      accountBId,
    );
    expect(stillThere?.id).toBe(accountBId);
  });
});
