import { afterEach, describe, expect, it, vi } from "vitest";

import {
  categoryRepository,
  transactionRepository,
} from "@/server/repositories";

import {
  DuplicateCategoryError,
  ProtectedCategoryError,
  createCategory,
  deleteCategory,
  updateCategory,
} from "./mutate";

type Db = Parameters<typeof createCategory>[0];
type CategoryRow = Awaited<ReturnType<typeof categoryRepository.findById>>;

// Os repositórios são mockados; `transaction` só executa o callback com o
// próprio db para exercitar o fluxo do service.
const db = {
  transaction: (fn: (tx: unknown) => unknown) => fn(db),
} as unknown as Db;

function category(overrides: Partial<NonNullable<CategoryRow>>) {
  return {
    id: "cat-1",
    userId: "user-1",
    name: "Academia",
    color: "#22C55E",
    kind: "expense",
    icon: "lazer",
    monthlyBudget: null,
    parentId: null,
    ...overrides,
  } as NonNullable<CategoryRow>;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("createCategory", () => {
  it("creates with budget as numeric string and invalidates cache", async () => {
    vi.spyOn(categoryRepository, "listByUser").mockResolvedValue([]);
    const create = vi
      .spyOn(categoryRepository, "create")
      .mockResolvedValue(category({}));
    const invalidate = vi.fn().mockResolvedValue(undefined);

    await createCategory(
      db,
      "user-1",
      {
        name: "Academia",
        color: "#22C55E",
        icon: "lazer",
        kind: "expense",
        monthlyBudget: 150,
      },
      { invalidate },
    );

    expect(create.mock.calls[0]![1]).toMatchObject({
      userId: "user-1",
      monthlyBudget: "150.00",
    });
    expect(invalidate).toHaveBeenCalledWith("user-1");
  });

  it("rejects duplicated names ignoring case and accents", async () => {
    vi.spyOn(categoryRepository, "listByUser").mockResolvedValue([
      category({ name: "Educação" }),
    ]);
    const create = vi.spyOn(categoryRepository, "create");

    await expect(
      createCategory(
        db,
        "user-1",
        {
          name: "educacao",
          color: "#22C55E",
          icon: "educacao",
          kind: "expense",
        },
        { invalidate: vi.fn() },
      ),
    ).rejects.toBeInstanceOf(DuplicateCategoryError);
    expect(create).not.toHaveBeenCalled();
  });

  it("allows the same name for a different kind", async () => {
    vi.spyOn(categoryRepository, "listByUser").mockResolvedValue([
      category({ name: "Outros", kind: "expense" }),
    ]);
    vi.spyOn(categoryRepository, "create").mockResolvedValue(category({}));

    await expect(
      createCategory(
        db,
        "user-1",
        { name: "Outros", color: "#94A3B8", icon: "outros", kind: "income" },
        { invalidate: vi.fn().mockResolvedValue(undefined) },
      ),
    ).resolves.toBeDefined();
  });
});

describe("updateCategory", () => {
  it("returns undefined when the category is not the user's", async () => {
    vi.spyOn(categoryRepository, "findById").mockResolvedValue(undefined);
    const update = vi.spyOn(categoryRepository, "update");

    const result = await updateCategory(
      db,
      "user-1",
      "cat-x",
      { color: "#000000" },
      { invalidate: vi.fn() },
    );

    expect(result).toBeUndefined();
    expect(update).not.toHaveBeenCalled();
  });

  it("clears the budget when monthlyBudget is null", async () => {
    vi.spyOn(categoryRepository, "findById").mockResolvedValue(
      category({ monthlyBudget: "300.00" }),
    );
    const update = vi
      .spyOn(categoryRepository, "update")
      .mockResolvedValue(category({}));

    await updateCategory(
      db,
      "user-1",
      "cat-1",
      { monthlyBudget: null },
      { invalidate: vi.fn().mockResolvedValue(undefined) },
    );

    expect(update.mock.calls[0]![3]).toMatchObject({ monthlyBudget: null });
  });

  it("does not allow renaming the fallback category", async () => {
    vi.spyOn(categoryRepository, "findById").mockResolvedValue(
      category({ name: "Outros" }),
    );

    await expect(
      updateCategory(
        db,
        "user-1",
        "cat-1",
        { name: "Diversos" },
        { invalidate: vi.fn() },
      ),
    ).rejects.toBeInstanceOf(ProtectedCategoryError);
  });
});

describe("deleteCategory", () => {
  it("moves transactions to the existing Outros of the same kind", async () => {
    vi.spyOn(categoryRepository, "findById").mockResolvedValue(category({}));
    vi.spyOn(categoryRepository, "listByUser").mockResolvedValue([
      category({}),
      category({ id: "cat-outros-income", name: "Outros", kind: "income" }),
      category({ id: "cat-outros", name: "Outros", kind: "expense" }),
    ]);
    const create = vi.spyOn(categoryRepository, "create");
    const reassign = vi
      .spyOn(transactionRepository, "reassignCategory")
      .mockResolvedValue(4);
    const remove = vi
      .spyOn(categoryRepository, "delete")
      .mockResolvedValue(category({}));
    const invalidate = vi.fn().mockResolvedValue(undefined);

    const result = await deleteCategory(db, "user-1", "cat-1", { invalidate });

    expect(create).not.toHaveBeenCalled();
    expect(reassign).toHaveBeenCalledWith(db, "user-1", "cat-1", "cat-outros");
    expect(remove).toHaveBeenCalledWith(db, "user-1", "cat-1");
    // Reatribui antes de excluir: nunca deixa transação órfã.
    expect(reassign.mock.invocationCallOrder[0]).toBeLessThan(
      remove.mock.invocationCallOrder[0]!,
    );
    expect(result).toEqual({
      id: "cat-1",
      movedCount: 4,
      movedTo: { id: "cat-outros", name: "Outros" },
    });
    expect(invalidate).toHaveBeenCalledWith("user-1");
  });

  it("creates Outros when it does not exist", async () => {
    vi.spyOn(categoryRepository, "findById").mockResolvedValue(category({}));
    vi.spyOn(categoryRepository, "listByUser").mockResolvedValue([
      category({}),
    ]);
    const create = vi
      .spyOn(categoryRepository, "create")
      .mockResolvedValue(category({ id: "cat-new-outros", name: "Outros" }));
    vi.spyOn(transactionRepository, "reassignCategory").mockResolvedValue(0);
    vi.spyOn(categoryRepository, "delete").mockResolvedValue(category({}));

    await deleteCategory(db, "user-1", "cat-1", {
      invalidate: vi.fn().mockResolvedValue(undefined),
    });

    expect(create.mock.calls[0]![1]).toMatchObject({
      userId: "user-1",
      name: "Outros",
      kind: "expense",
    });
  });

  it("refuses to delete the fallback category", async () => {
    vi.spyOn(categoryRepository, "findById").mockResolvedValue(
      category({ name: "Outros" }),
    );
    const remove = vi.spyOn(categoryRepository, "delete");
    const invalidate = vi.fn();

    await expect(
      deleteCategory(db, "user-1", "cat-1", { invalidate }),
    ).rejects.toBeInstanceOf(ProtectedCategoryError);
    expect(remove).not.toHaveBeenCalled();
    expect(invalidate).not.toHaveBeenCalled();
  });

  it("returns undefined for a category of another user", async () => {
    vi.spyOn(categoryRepository, "findById").mockResolvedValue(undefined);
    const invalidate = vi.fn();

    await expect(
      deleteCategory(db, "user-1", "cat-x", { invalidate }),
    ).resolves.toBeUndefined();
    expect(invalidate).not.toHaveBeenCalled();
  });
});
