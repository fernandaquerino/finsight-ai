// @vitest-environment node
import { randomUUID } from "node:crypto";

import { and, eq, gte, isNull } from "drizzle-orm";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Pool } from "pg";

import * as schema from "@/../db/schema";
import { hashPassword, verifyPassword } from "@/server/services/auth/password";

import { changePassword } from "./change-password";
import { deleteUserAccount } from "./delete-user-account";
import { InvalidCurrentPasswordError, PasswordNotSetError } from "./errors";
import { exportUserData } from "./export-user-data";
import { getSettings } from "./get-settings";
import { updateSettings } from "./update-settings";

const databaseUrl = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
const shouldRunIntegrationTests =
  Boolean(process.env.CI) ||
  process.env.RUN_INTEGRATION_TESTS === "1" ||
  Boolean(process.env.TEST_DATABASE_URL);

const describeIntegration = shouldRunIntegrationTests
  ? describe
  : describe.skip;

describeIntegration("settings services", () => {
  let pool: Pool;
  let db: NodePgDatabase<typeof schema>;
  const createdUserIds: string[] = [];
  // Marco temporal para limitar a limpeza de audit_logs às linhas desta suíte.
  const suiteStartedAt = new Date();

  // Cria um usuário fictício com profile — é o estado em que estas telas são
  // alcançáveis (o layout exige onboarding concluído).
  async function createUser(options: { withPassword?: boolean } = {}) {
    const id = randomUUID();
    await db.insert(schema.users).values({
      id,
      email: `settings-${id}@finsight.local`,
      name: "Usuário Teste",
      oauthProvider: options.withPassword ? "credentials" : "google",
      passwordHash: options.withPassword
        ? await hashPassword("senha-atual-1")
        : null,
    });
    await db.insert(schema.userProfiles).values({
      userId: id,
      onboardingCompletedAt: new Date(),
      aiConsentAt: new Date(),
    });
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
      // audit_logs sobrevive ao delete com user_id nulo (append-only). Limpa só
      // as linhas órfãs criadas DEPOIS do início desta suíte: sem o filtro de
      // tempo, rodar contra um banco de desenvolvimento apagaria trilhas de
      // auditoria legítimas de exclusões anteriores.
      await db
        .delete(schema.auditLogs)
        .where(
          and(
            isNull(schema.auditLogs.userId),
            gte(schema.auditLogs.createdAt, suiteStartedAt),
          ),
        );
    }
    await pool?.end();
  });

  it("reads defaults before any preference is saved", async () => {
    const userId = await createUser();

    const settings = await getSettings(db, userId);

    expect(settings.ai.autoCategorize).toBe(true);
    expect(settings.ai.proactiveInsights).toBe(true);
    expect(settings.notifications).toEqual({
      spendAlerts: true,
      weeklySummary: true,
      installmentReminders: false,
    });
    expect(settings.profile.hasCpf).toBe(false);
    expect(settings.profile.cpfMasked).toBeNull();
  });

  it("persists a partial patch across the three tables", async () => {
    const userId = await createUser();

    await updateSettings(db, userId, {
      name: "Nome Atualizado",
      phone: "+55 11 98888-7777",
      aiProactiveInsights: false,
      notifications: { installmentReminders: true },
    });

    const settings = await getSettings(db, userId);

    expect(settings.profile.name).toBe("Nome Atualizado");
    expect(settings.profile.phone).toBe("+55 11 98888-7777");
    expect(settings.ai.proactiveInsights).toBe(false);
    // Não enviado no patch: mantém o default.
    expect(settings.ai.autoCategorize).toBe(true);
    expect(settings.notifications.installmentReminders).toBe(true);
    expect(settings.notifications.spendAlerts).toBe(true);
  });

  it("never returns the CPF in clear text", async () => {
    const userId = await createUser();

    await updateSettings(db, userId, { cpf: "52998224725" });
    const settings = await getSettings(db, userId);

    expect(settings.profile.hasCpf).toBe(true);
    expect(settings.profile.cpfMasked).toBe("***.***.247-**");
    expect(JSON.stringify(settings)).not.toContain("52998224725");
  });

  it("isolates users: a patch never touches another account", async () => {
    const userAId = await createUser();
    const userBId = await createUser();

    await updateSettings(db, userAId, { name: "Somente A" });

    const settingsB = await getSettings(db, userBId);
    expect(settingsB.profile.name).toBe("Usuário Teste");
  });

  it("exports only the requesting user's data and logs the event", async () => {
    const userAId = await createUser();
    const userBId = await createUser();

    const [accountA] = await db
      .insert(schema.accounts)
      .values({ userId: userAId, name: "Conta de A", type: "checking" })
      .returning();
    await db
      .insert(schema.accounts)
      .values({ userId: userBId, name: "Conta de B", type: "checking" });

    const { data, counts } = await exportUserData(db, userAId);

    expect(counts.accounts).toBe(1);
    expect(data.accounts).toHaveLength(1);
    expect(JSON.stringify(data)).toContain(accountA?.name);
    expect(JSON.stringify(data)).not.toContain("Conta de B");
    // passwordHash nunca entra no pacote exportado.
    expect(Object.keys(data.user)).not.toContain("passwordHash");

    const logs = await db
      .select()
      .from(schema.auditLogs)
      .where(eq(schema.auditLogs.userId, userAId));
    expect(logs.map((log) => log.action)).toContain("data_export");
  });

  it("changes the password only with the correct current one", async () => {
    const userId = await createUser({ withPassword: true });

    await expect(
      changePassword(db, userId, {
        currentPassword: "senha-errada-1",
        newPassword: "senha-nova-99",
        confirmPassword: "senha-nova-99",
      }),
    ).rejects.toBeInstanceOf(InvalidCurrentPasswordError);

    await changePassword(db, userId, {
      currentPassword: "senha-atual-1",
      newPassword: "senha-nova-99",
      confirmPassword: "senha-nova-99",
    });

    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId));
    await expect(
      verifyPassword("senha-nova-99", user?.passwordHash ?? ""),
    ).resolves.toBe(true);
  });

  it("refuses to change the password of an OAuth-only account", async () => {
    const userId = await createUser();

    await expect(
      changePassword(db, userId, {
        currentPassword: "qualquer-coisa-1",
        newPassword: "senha-nova-99",
        confirmPassword: "senha-nova-99",
      }),
    ).rejects.toBeInstanceOf(PasswordNotSetError);
  });

  it("hard deletes every domain row and keeps an anonymous audit trail", async () => {
    const userId = await createUser({ withPassword: true });
    createdUserIds.pop();

    const [account] = await db
      .insert(schema.accounts)
      .values({ userId, name: "Conta a apagar", type: "checking" })
      .returning();
    await db.insert(schema.goals).values({
      userId,
      name: "Meta a apagar",
      icon: "piggy-bank",
      targetAmount: "100.00",
    });
    await db.insert(schema.transactions).values({
      userId,
      accountId: account?.id ?? "",
      amount: "-10.00",
      kind: "expense",
      description: "Lançamento a apagar",
      occurredAt: new Date("2026-05-01T12:00:00.000Z"),
      origin: "manual",
      dedupeHash: randomUUID(),
    });
    await updateSettings(db, userId, {
      notifications: { spendAlerts: false },
    });

    await deleteUserAccount(db, userId);

    for (const table of [
      schema.users,
      schema.userProfiles,
      schema.accounts,
      schema.transactions,
      schema.goals,
      schema.notificationPreferences,
    ]) {
      const rows = await db.select().from(table);
      const remaining = rows.filter((row) =>
        "userId" in row ? row.userId === userId : row.id === userId,
      );
      expect(remaining).toHaveLength(0);
    }

    // A prova da exclusão sobrevive, sem vínculo de PII.
    const orphanLogs = await db
      .select()
      .from(schema.auditLogs)
      .where(isNull(schema.auditLogs.userId));
    expect(orphanLogs.map((log) => log.action)).toContain("account_delete");
  });
});
