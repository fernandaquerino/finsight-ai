// @vitest-environment node
import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Pool } from "pg";

import * as schema from "@/../db/schema";
import { accountRepository } from "@/server/repositories/accounts";
import { categoryRepository } from "@/server/repositories/categories";
import { userProfileRepository } from "@/server/repositories/user-profiles";
import type { OnboardingInput } from "@/server/validators/onboarding";

import { completeOnboarding } from "./complete-onboarding";

const databaseUrl = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
const shouldRunIntegrationTests =
  Boolean(process.env.CI) ||
  process.env.RUN_INTEGRATION_TESTS === "1" ||
  Boolean(process.env.TEST_DATABASE_URL);

const describeIntegration = shouldRunIntegrationTests
  ? describe
  : describe.skip;

describeIntegration("completeOnboarding", () => {
  let pool: Pool;
  let db: NodePgDatabase<typeof schema>;
  const createdUserIds: string[] = [];

  async function createUser() {
    const id = randomUUID();
    await db
      .insert(schema.users)
      .values({ id, email: `onboarding-${id}@finsight.local` });
    createdUserIds.push(id);
    return id;
  }

  beforeAll(async () => {
    if (!databaseUrl) {
      throw new Error("Set TEST_DATABASE_URL to run integration tests.");
    }
    pool = new Pool({ connectionString: databaseUrl });
    db = drizzle(pool, { schema });
  });

  afterAll(async () => {
    if (db) {
      for (const id of createdUserIds) {
        await db.delete(schema.users).where(eq(schema.users.id, id));
      }
    }
    await pool?.end();
  });

  const baseInput: OnboardingInput = {
    name: "Marina Teste",
    currency: "BRL",
    trackingStartMonth: "2026-06-01",
    primaryGoal: "organize",
    categoryKeys: ["alimentacao", "moradia", "transporte"],
    accounts: [
      { name: "Nubank", type: "checking", initialBalance: 1500.5 },
      { name: "Carteira", type: "other" },
    ],
    aiConsent: true,
  };

  it("persists profile, categories and accounts atomically with consent", async () => {
    const userId = await createUser();

    await completeOnboarding(db, userId, baseInput);

    const profile = await userProfileRepository.getByUserId(db, userId);
    expect(profile?.currency).toBe("BRL");
    expect(profile?.primaryGoal).toBe("organize");
    expect(profile?.trackingStartMonth).toBe("2026-06-01");
    expect(profile?.aiConsentAt).toBeInstanceOf(Date);
    expect(profile?.onboardingCompletedAt).toBeInstanceOf(Date);

    const categories = await categoryRepository.listByUser(db, userId);
    expect(categories).toHaveLength(3);
    expect(categories.map((c) => c.name).sort()).toEqual([
      "Alimentação",
      "Moradia",
      "Transporte",
    ]);

    const accounts = await accountRepository.listByUser(db, userId);
    expect(accounts).toHaveLength(2);
    const nubank = accounts.find((a) => a.name === "Nubank");
    expect(nubank?.initialBalance).toBe("1500.50");
    const carteira = accounts.find((a) => a.name === "Carteira");
    expect(carteira?.initialBalance).toBeNull();

    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, userId),
    });
    expect(user?.name).toBe("Marina Teste");
  });

  it("marks onboarding complete but leaves ai_consent_at null when not consented", async () => {
    const userId = await createUser();

    await completeOnboarding(db, userId, {
      ...baseInput,
      categoryKeys: [],
      accounts: [],
      aiConsent: false,
    });

    const profile = await userProfileRepository.getByUserId(db, userId);
    expect(profile?.onboardingCompletedAt).toBeInstanceOf(Date);
    expect(profile?.aiConsentAt).toBeNull();
  });
});
