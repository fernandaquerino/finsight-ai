// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  db: {},
  requireUserId: vi.fn(),
  listTransactions: vi.fn(),
  UnauthorizedError: class UnauthorizedError extends Error {
    readonly statusCode = 401;
    readonly code = "UNAUTHORIZED";
  },
}));

vi.mock("@/lib/db", () => ({
  getDb: () => mocks.db,
}));

vi.mock("@/server/auth/session", () => {
  return {
    UnauthorizedError: mocks.UnauthorizedError,
    requireUserId: mocks.requireUserId,
  };
});

vi.mock("@/server/services/transactions/list", () => ({
  listTransactions: mocks.listTransactions,
}));

describe("GET /api/transactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireUserId.mockResolvedValue("user-1");
    mocks.listTransactions.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      hasNext: false,
    });
  });

  it("returns a filtered transaction list for the current user", async () => {
    const { GET } = await import("./route");
    const request = new Request(
      "http://localhost/api/transactions?from=2026-06-01&to=2026-06-30&kind=expense&search=mercado&page=2&limit=10",
    );

    const response = await GET(request);

    await expect(response.json()).resolves.toEqual({
      data: {
        items: [],
        total: 0,
        page: 1,
        hasNext: false,
      },
    });
    expect(response.status).toBe(200);
    expect(mocks.listTransactions).toHaveBeenCalledWith(mocks.db, "user-1", {
      from: "2026-06-01",
      to: "2026-06-30",
      kind: "expense",
      search: "mercado",
      page: 2,
      limit: 10,
    });
  });

  it("rejects invalid query params", async () => {
    const { GET } = await import("./route");
    const request = new Request(
      "http://localhost/api/transactions?kind=invalid&page=0",
    );

    const response = await GET(request);

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "INVALID_QUERY" },
    });
    expect(mocks.listTransactions).not.toHaveBeenCalled();
  });

  it("requires authentication", async () => {
    mocks.requireUserId.mockRejectedValue(new mocks.UnauthorizedError());

    const { GET } = await import("./route");
    const response = await GET(
      new Request("http://localhost/api/transactions"),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "UNAUTHORIZED" },
    });
  });
});
