// @vitest-environment node
import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Pool } from "pg";

import * as schema from "@/../db/schema";
import { getCategoriesSummary } from "@/server/services/categories/summary";

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
      icon: "moradia",
      monthlyBudget: "500.00",
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

  it("category update/delete do not affect another user's category", async () => {
    const updated = await categoryRepository.update(db, userAId, categoryBId, {
      name: "Invadida",
    });
    const deleted = await categoryRepository.delete(db, userAId, categoryBId);

    expect(updated).toBeUndefined();
    expect(deleted).toBeUndefined();
    const stillThere = await categoryRepository.findById(
      db,
      userBId,
      categoryBId,
    );
    expect(stillThere?.name).toBe("Categoria B");
  });

  it("reassignCategory does not move another user's transactions", async () => {
    const moved = await transactionRepository.reassignCategory(
      db,
      userAId,
      categoryBId,
      categoryBId,
    );
    expect(moved).toBe(0);
  });

  it("category aggregations only include the requester's transactions", async () => {
    const totals = await transactionRepository.sumByCategoryInPeriod(
      db,
      userAId,
      new Date(0),
      new Date(Date.now() + 86_400_000),
    );
    const counts = await transactionRepository.countByCategory(db, userAId);

    expect(totals).toHaveLength(0);
    expect(counts).toHaveLength(0);
  });

  it("loads category budgets and icons in the summary without exposing another user", async () => {
    const month = new Date().toISOString().slice(0, 7);
    const summaryA = await getCategoriesSummary(db, userAId, month);
    const summaryB = await getCategoriesSummary(db, userBId, month);

    expect(summaryA.items).toHaveLength(0);
    expect(summaryB.items).toEqual([
      expect.objectContaining({
        id: categoryBId,
        icon: "moradia",
        monthlyBudget: 500,
      }),
    ]);
  });
});
