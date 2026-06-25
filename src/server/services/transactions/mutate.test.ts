import { afterEach, describe, expect, it, vi } from "vitest";

import { transactionRepository } from "@/server/repositories";

import { createTransaction, deleteTransaction } from "./mutate";

// db é irrelevante aqui: o repositório é mockado. Cast mínimo para o tipo.
const db = {} as Parameters<typeof createTransaction>[0];

afterEach(() => {
  vi.restoreAllMocks();
});

describe("transaction mutations invalidate the dashboard cache", () => {
  it("invalidates after creating a transaction", async () => {
    vi.spyOn(transactionRepository, "create").mockResolvedValue({
      id: "t1",
      userId: "user-1",
    } as Awaited<ReturnType<typeof transactionRepository.create>>);
    const invalidate = vi.fn().mockResolvedValue(undefined);

    await createTransaction(
      db,
      { userId: "user-1" } as Parameters<typeof createTransaction>[1],
      { invalidate },
    );

    expect(invalidate).toHaveBeenCalledWith("user-1");
  });

  it("invalidates after deleting an existing transaction", async () => {
    vi.spyOn(transactionRepository, "softDelete").mockResolvedValue({
      id: "t1",
      userId: "user-1",
    } as Awaited<ReturnType<typeof transactionRepository.softDelete>>);
    const invalidate = vi.fn().mockResolvedValue(undefined);

    await deleteTransaction(db, "user-1", "t1", { invalidate });

    expect(invalidate).toHaveBeenCalledWith("user-1");
  });

  it("does not invalidate when delete finds nothing to remove", async () => {
    vi.spyOn(transactionRepository, "softDelete").mockResolvedValue(
      undefined as Awaited<ReturnType<typeof transactionRepository.softDelete>>,
    );
    const invalidate = vi.fn().mockResolvedValue(undefined);

    await deleteTransaction(db, "user-1", "missing", { invalidate });

    expect(invalidate).not.toHaveBeenCalled();
  });
});
