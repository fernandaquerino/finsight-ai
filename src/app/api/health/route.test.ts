// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  getPostgresPool: () => ({
    query: vi.fn().mockResolvedValue({ rows: [{ value: 1 }] }),
  }),
}));

vi.mock("@/lib/redis", () => ({
  getRedisClient: vi.fn().mockResolvedValue({
    ping: vi.fn().mockResolvedValue("PONG"),
  }),
}));

describe("GET /api/health", () => {
  it("returns ok when Postgres and Redis are reachable", async () => {
    const { GET } = await import("@/app/api/health/route");

    const response = await GET();

    await expect(response.json()).resolves.toEqual({
      status: "ok",
      services: {
        postgres: "ok",
        redis: "ok",
      },
    });
    expect(response.status).toBe(200);
  });
});
