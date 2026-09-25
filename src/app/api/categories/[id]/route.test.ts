// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  db: {},
  requireUserId: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
  DuplicateCategoryError: class DuplicateCategoryError extends Error {
    readonly code = "DUPLICATE_CATEGORY";
  },
  ProtectedCategoryError: class ProtectedCategoryError extends Error {
    readonly code = "PROTECTED_CATEGORY";
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

vi.mock("@/server/services/categories/mutate", () => ({
  updateCategory: mocks.updateCategory,
  deleteCategory: mocks.deleteCategory,
  DuplicateCategoryError: mocks.DuplicateCategoryError,
  ProtectedCategoryError: mocks.ProtectedCategoryError,
}));

const ID = "44444444-4444-4444-8444-444444444444";

function context(id: string) {
  return { params: Promise.resolve({ id }) };
}

function patchRequest(body: unknown): Request {
  return new Request(`http://localhost/api/categories/${ID}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("PATCH /api/categories/:id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireUserId.mockResolvedValue("user-1");
    mocks.updateCategory.mockResolvedValue({ id: ID });
  });

  it("updates the category using the session userId", async () => {
    const { PATCH } = await import("./route");

    const response = await PATCH(
      patchRequest({ monthlyBudget: 250, userId: "attacker" }),
      context(ID),
    );

    expect(response.status).toBe(200);
    expect(mocks.updateCategory).toHaveBeenCalledWith(mocks.db, "user-1", ID, {
      monthlyBudget: 250,
    });
  });

  it("returns 401 without session", async () => {
    mocks.requireUserId.mockRejectedValue(new mocks.UnauthorizedError());
    const { PATCH } = await import("./route");

    const response = await PATCH(patchRequest({ name: "X" }), context(ID));

    expect(response.status).toBe(401);
  });

  it("returns 422 for invalid input", async () => {
    const { PATCH } = await import("./route");

    const response = await PATCH(patchRequest({ color: "red" }), context(ID));

    expect(response.status).toBe(422);
    expect(mocks.updateCategory).not.toHaveBeenCalled();
  });

  it("returns 404 when the category is not the user's", async () => {
    mocks.updateCategory.mockResolvedValue(undefined);
    const { PATCH } = await import("./route");

    const response = await PATCH(patchRequest({ name: "X" }), context(ID));

    expect(response.status).toBe(404);
  });

  it("returns 409 on duplicated name", async () => {
    mocks.updateCategory.mockRejectedValue(
      new mocks.DuplicateCategoryError("dup"),
    );
    const { PATCH } = await import("./route");

    const response = await PATCH(patchRequest({ name: "X" }), context(ID));

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "DUPLICATE_CATEGORY" },
    });
  });

  it("rejects an invalid id with 400", async () => {
    const { PATCH } = await import("./route");

    const response = await PATCH(patchRequest({ name: "X" }), context("nope"));

    expect(response.status).toBe(400);
  });
});

describe("DELETE /api/categories/:id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireUserId.mockResolvedValue("user-1");
  });

  it("returns what was moved", async () => {
    const result = {
      id: ID,
      movedCount: 3,
      movedTo: { id: "outros", name: "Outros" },
    };
    mocks.deleteCategory.mockResolvedValue(result);
    const { DELETE } = await import("./route");

    const response = await DELETE(new Request("http://localhost"), context(ID));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ data: result });
    expect(mocks.deleteCategory).toHaveBeenCalledWith(mocks.db, "user-1", ID);
  });

  it("returns 404 when missing", async () => {
    mocks.deleteCategory.mockResolvedValue(undefined);
    const { DELETE } = await import("./route");

    const response = await DELETE(new Request("http://localhost"), context(ID));

    expect(response.status).toBe(404);
  });

  it("returns 409 for the protected fallback category", async () => {
    mocks.deleteCategory.mockRejectedValue(
      new mocks.ProtectedCategoryError("protected"),
    );
    const { DELETE } = await import("./route");

    const response = await DELETE(new Request("http://localhost"), context(ID));

    expect(response.status).toBe(409);
  });
});
