import { expect, test } from "@playwright/test";

test("renders the home page", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: "To get started, edit the page.tsx file.",
    }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Documentation" })).toBeVisible();
});

test("reports service health", async ({ request }) => {
  test.skip(
    !process.env.CI && !(process.env.DATABASE_URL && process.env.REDIS_URL),
    "requires Postgres and Redis test services",
  );

  const response = await request.get("/api/health");

  expect(response.ok()).toBe(true);
  await expect(response.json()).resolves.toEqual({
    status: "ok",
    services: {
      postgres: "ok",
      redis: "ok",
    },
  });
});
