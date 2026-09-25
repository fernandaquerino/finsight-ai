import { expect, test } from "@playwright/test";

// Isolamento e autorização: nenhum endpoint de Configurações responde sem
// sessão. Não exige usuário logado — é justamente a ausência de sessão que se
// verifica aqui.
//
// `Future` — o fluxo autenticado (alternar um toggle, recarregar e conferir que
// persistiu) depende de um harness de login no Playwright, que o projeto ainda
// não tem. Ver docs/backlog.md.
test.describe("settings endpoints require a session", () => {
  const unauthenticatedCalls = [
    { name: "GET /api/settings", method: "get" as const, url: "/api/settings" },
    {
      name: "PATCH /api/settings",
      method: "patch" as const,
      url: "/api/settings",
      data: { aiAutoCategorize: false },
    },
    {
      name: "POST /api/settings/password",
      method: "post" as const,
      url: "/api/settings/password",
      data: {
        currentPassword: "a",
        newPassword: "senha-nova-99",
        confirmPassword: "senha-nova-99",
      },
    },
    {
      name: "POST /api/settings/export",
      method: "post" as const,
      url: "/api/settings/export",
    },
    {
      name: "DELETE /api/settings/account",
      method: "delete" as const,
      url: "/api/settings/account",
      data: { confirmation: "ENCERRAR" },
    },
    {
      name: "POST /api/accounts",
      method: "post" as const,
      url: "/api/accounts",
      data: { name: "Conta", type: "checking" },
    },
  ];

  for (const call of unauthenticatedCalls) {
    test(`${call.name} answers 401`, async ({ request }) => {
      const response = await request[call.method](call.url, {
        data: call.data,
      });

      expect(response.status()).toBe(401);
      await expect(response.json()).resolves.toMatchObject({
        error: { code: "UNAUTHORIZED" },
      });
    });
  }
});

test("the settings page sends a visitor without session to login", async ({
  page,
}) => {
  test.skip(
    !process.env.CI && !process.env.DATABASE_URL,
    "requires the Postgres test service",
  );

  await page.goto("/settings");

  await expect(page).toHaveURL(/\/login/);
});
