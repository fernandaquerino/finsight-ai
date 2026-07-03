// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  db: {},
  requireUserId: vi.fn(),
  listTransactions: vi.fn(),
  createTransaction: vi.fn(),
  TransactionOwnershipError: class TransactionOwnershipError extends Error {
    readonly code = "INVALID_REFERENCE";
  },
  DuplicateTransactionError: class DuplicateTransactionError extends Error {
    readonly code = "DUPLICATE_TRANSACTION";
  },
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

vi.mock("@/server/services/transactions/mutate", () => ({
  createTransaction: mocks.createTransaction,
  TransactionOwnershipError: mocks.TransactionOwnershipError,
  DuplicateTransactionError: mocks.DuplicateTransactionError,
}));

const validBody = {
  accountId: "11111111-1111-4111-8111-111111111111",
  categoryId: "22222222-2222-4222-8222-222222222222",
  amount: 28.5,
  kind: "expense",
  description: "Padaria",
  occurredAt: "2026-06-20",
};

function postRequest(body: unknown): Request {
  return new Request("http://localhost/api/transactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

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

describe("POST /api/transactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireUserId.mockResolvedValue("user-1");
    mocks.createTransaction.mockResolvedValue({ id: "t1", userId: "user-1" });
  });

  it("creates a transaction for the current user", async () => {
    const { POST } = await import("./route");

    const response = await POST(postRequest(validBody));

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      data: { id: "t1", userId: "user-1" },
    });
    expect(mocks.createTransaction).toHaveBeenCalledWith(
      mocks.db,
      "user-1",
      expect.objectContaining({ accountId: validBody.accountId, amount: 28.5 }),
    );
  });

  it("rejects invalid body with 422", async () => {
    const { POST } = await import("./route");

    const response = await POST(postRequest({ amount: -5 }));

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "INVALID_BODY" },
    });
    expect(mocks.createTransaction).not.toHaveBeenCalled();
  });

  it("maps ownership errors to 422", async () => {
    mocks.createTransaction.mockRejectedValue(
      new mocks.TransactionOwnershipError("Conta não encontrada."),
    );
    const { POST } = await import("./route");

    const response = await POST(postRequest(validBody));

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "INVALID_REFERENCE" },
    });
  });

  it("maps duplicate errors to 409", async () => {
    mocks.createTransaction.mockRejectedValue(
      new mocks.DuplicateTransactionError(),
    );
    const { POST } = await import("./route");

    const response = await POST(postRequest(validBody));

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "DUPLICATE_TRANSACTION" },
    });
  });

  it("requires authentication", async () => {
    mocks.requireUserId.mockRejectedValue(new mocks.UnauthorizedError());
    const { POST } = await import("./route");

    const response = await POST(postRequest(validBody));

    expect(response.status).toBe(401);
    expect(mocks.createTransaction).not.toHaveBeenCalled();
  });
});
