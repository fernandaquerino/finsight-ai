// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  db: {},
  requireUserId: vi.fn(),
  updateTransaction: vi.fn(),
  deleteTransaction: vi.fn(),
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

vi.mock("@/lib/db", () => ({ getDb: () => mocks.db }));

vi.mock("@/server/auth/session", () => ({
  UnauthorizedError: mocks.UnauthorizedError,
  requireUserId: mocks.requireUserId,
}));

vi.mock("@/server/services/transactions/mutate", () => ({
  updateTransaction: mocks.updateTransaction,
  deleteTransaction: mocks.deleteTransaction,
  TransactionOwnershipError: mocks.TransactionOwnershipError,
  DuplicateTransactionError: mocks.DuplicateTransactionError,
}));

const ID = "33333333-3333-4333-8333-333333333333";

function context(id: string) {
  return { params: Promise.resolve({ id }) };
}

function patchRequest(body: unknown): Request {
  return new Request(`http://localhost/api/transactions/${ID}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("PATCH /api/transactions/:id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireUserId.mockResolvedValue("user-1");
    mocks.updateTransaction.mockResolvedValue({ id: ID, userId: "user-1" });
  });

  it("recategorizes a transaction", async () => {
    const { PATCH } = await import("./route");

    const response = await PATCH(
      patchRequest({ categoryId: "22222222-2222-4222-8222-222222222222" }),
      context(ID),
    );

    expect(response.status).toBe(200);
    expect(mocks.updateTransaction).toHaveBeenCalledWith(
      mocks.db,
      "user-1",
      ID,
      { categoryId: "22222222-2222-4222-8222-222222222222" },
    );
  });

  it("returns 404 when the transaction is missing", async () => {
    mocks.updateTransaction.mockResolvedValue(undefined);
    const { PATCH } = await import("./route");

    const response = await PATCH(
      patchRequest({ description: "x" }),
      context(ID),
    );

    expect(response.status).toBe(404);
  });

  it("rejects an empty patch with 422", async () => {
    const { PATCH } = await import("./route");

    const response = await PATCH(patchRequest({}), context(ID));

    expect(response.status).toBe(422);
    expect(mocks.updateTransaction).not.toHaveBeenCalled();
  });

  it("rejects an invalid id with 400", async () => {
    const { PATCH } = await import("./route");

    const response = await PATCH(
      patchRequest({ description: "x" }),
      context("nope"),
    );

    expect(response.status).toBe(400);
  });
});

describe("DELETE /api/transactions/:id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireUserId.mockResolvedValue("user-1");
  });

  it("soft-deletes a transaction", async () => {
    mocks.deleteTransaction.mockResolvedValue({ id: ID });
    const { DELETE } = await import("./route");

    const response = await DELETE(new Request("http://localhost"), context(ID));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ data: { id: ID } });
    expect(mocks.deleteTransaction).toHaveBeenCalledWith(
      mocks.db,
      "user-1",
      ID,
    );
  });

  it("returns 404 when nothing was deleted", async () => {
    mocks.deleteTransaction.mockResolvedValue(undefined);
    const { DELETE } = await import("./route");

    const response = await DELETE(new Request("http://localhost"), context(ID));

    expect(response.status).toBe(404);
  });

  it("requires authentication", async () => {
    mocks.requireUserId.mockRejectedValue(new mocks.UnauthorizedError());
    const { DELETE } = await import("./route");

    const response = await DELETE(new Request("http://localhost"), context(ID));

    expect(response.status).toBe(401);
    expect(mocks.deleteTransaction).not.toHaveBeenCalled();
  });
});
