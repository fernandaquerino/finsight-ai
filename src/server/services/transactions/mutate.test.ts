import { afterEach, describe, expect, it, vi } from "vitest";

import {
  accountRepository,
  categoryRepository,
  transactionRepository,
} from "@/server/repositories";
import type { CreateTransactionInput } from "@/server/validators/transactions";

import {
  TransactionOwnershipError,
  createTransaction,
  deleteTransaction,
  updateTransaction,
} from "./mutate";

// db é irrelevante aqui: os repositórios são mockados. Cast mínimo para o tipo.
const db = {} as Parameters<typeof createTransaction>[0];

const validInput: CreateTransactionInput = {
  accountId: "11111111-1111-4111-8111-111111111111",
  categoryId: "22222222-2222-4222-8222-222222222222",
  amount: 28.5,
  kind: "expense",
  description: "Padaria",
  occurredAt: "2026-06-20",
  currency: "BRL",
};

function mockOwnership(): void {
  vi.spyOn(accountRepository, "findById").mockResolvedValue({
    id: validInput.accountId,
    userId: "user-1",
  } as Awaited<ReturnType<typeof accountRepository.findById>>);
  vi.spyOn(categoryRepository, "findById").mockResolvedValue({
    id: validInput.categoryId,
    userId: "user-1",
  } as Awaited<ReturnType<typeof categoryRepository.findById>>);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("createTransaction", () => {
  it("computes dedupeHash, sets origin manual and invalidates the cache", async () => {
    mockOwnership();
    const create = vi.spyOn(transactionRepository, "create").mockResolvedValue({
      id: "t1",
      userId: "user-1",
    } as Awaited<ReturnType<typeof transactionRepository.create>>);
    const invalidate = vi.fn().mockResolvedValue(undefined);

    await createTransaction(db, "user-1", validInput, { invalidate });

    const inserted = create.mock.calls[0]![1];
    expect(inserted.userId).toBe("user-1");
    expect(inserted.origin).toBe("manual");
    expect(inserted.amount).toBe("28.50");
    expect(inserted.dedupeHash).toMatch(/^[0-9a-f]{64}$/);
    expect(invalidate).toHaveBeenCalledWith("user-1");
  });

  it("rejects when the account does not belong to the user", async () => {
    vi.spyOn(accountRepository, "findById").mockResolvedValue(
      undefined as Awaited<ReturnType<typeof accountRepository.findById>>,
    );
    const create = vi.spyOn(transactionRepository, "create");
    const invalidate = vi.fn();

    await expect(
      createTransaction(db, "user-1", validInput, { invalidate }),
    ).rejects.toBeInstanceOf(TransactionOwnershipError);

    expect(create).not.toHaveBeenCalled();
    expect(invalidate).not.toHaveBeenCalled();
  });
});

describe("updateTransaction", () => {
  it("returns undefined and skips invalidation when the transaction is missing", async () => {
    vi.spyOn(transactionRepository, "findById").mockResolvedValue(
      undefined as Awaited<ReturnType<typeof transactionRepository.findById>>,
    );
    const invalidate = vi.fn();

    const result = await updateTransaction(
      db,
      "user-1",
      "missing",
      { categoryId: validInput.categoryId },
      { invalidate },
    );

    expect(result).toBeUndefined();
    expect(invalidate).not.toHaveBeenCalled();
  });

  it("recategorizes and invalidates the cache", async () => {
    vi.spyOn(transactionRepository, "findById").mockResolvedValue({
      id: "t1",
      userId: "user-1",
      accountId: validInput.accountId,
      categoryId: null,
      amount: "10.00",
      kind: "expense",
      description: "Padaria",
      occurredAt: new Date("2026-06-20T12:00:00.000Z"),
    } as Awaited<ReturnType<typeof transactionRepository.findById>>);
    vi.spyOn(accountRepository, "findById").mockResolvedValue({
      id: validInput.accountId,
      userId: "user-1",
    } as Awaited<ReturnType<typeof accountRepository.findById>>);
    vi.spyOn(categoryRepository, "findById").mockResolvedValue({
      id: validInput.categoryId,
      userId: "user-1",
    } as Awaited<ReturnType<typeof categoryRepository.findById>>);
    vi.spyOn(transactionRepository, "update").mockResolvedValue({
      id: "t1",
      userId: "user-1",
    } as Awaited<ReturnType<typeof transactionRepository.update>>);
    const invalidate = vi.fn().mockResolvedValue(undefined);

    await updateTransaction(
      db,
      "user-1",
      "t1",
      { categoryId: validInput.categoryId },
      { invalidate },
    );

    expect(invalidate).toHaveBeenCalledWith("user-1");
  });
});

describe("deleteTransaction", () => {
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
