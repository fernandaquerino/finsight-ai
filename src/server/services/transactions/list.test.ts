import { describe, expect, it, vi } from "vitest";

import type { transactionRepository } from "@/server/repositories";

import { listTransactions } from "./list";

const db = {} as Parameters<typeof listTransactions>[0];

function makeRepository(
  result: Awaited<ReturnType<typeof transactionRepository.listFiltered>>,
) {
  return {
    listFiltered: vi.fn().mockResolvedValue(result),
  };
}

describe("listTransactions", () => {
  it("passes user scoped filters to the repository", async () => {
    const repository = makeRepository({ items: [], total: 0 });

    await listTransactions(
      db,
      "user-1",
      {
        from: "2026-06-01",
        to: "2026-06-30",
        categoryId: "77a9de21-8362-4c93-bcc6-4f78d3e8e001",
        accountId: "2ecbb627-3d0b-4c2a-a2fe-20165fe5d001",
        kind: "expense",
        search: "mercado",
        page: 2,
        limit: 15,
      },
      { repository },
    );

    expect(repository.listFiltered).toHaveBeenCalledWith(db, "user-1", {
      from: new Date("2026-06-01T00:00:00.000Z"),
      toExclusive: new Date("2026-07-01T00:00:00.000Z"),
      categoryId: "77a9de21-8362-4c93-bcc6-4f78d3e8e001",
      accountId: "2ecbb627-3d0b-4c2a-a2fe-20165fe5d001",
      kind: "expense",
      search: "mercado",
      page: 2,
      limit: 15,
    });
  });

  it("returns items, total, page and hasNext", async () => {
    const occurredAt = new Date("2026-06-15T12:00:00.000Z");
    const repository = makeRepository({
      total: 26,
      items: [
        {
          id: "tx-1",
          description: "Salario",
          amount: "5000.00",
          currency: "BRL",
          kind: "income",
          occurredAt,
          origin: "manual",
          categoryId: "category-1",
          categoryName: "Receita",
          categoryColor: "#16a34a",
          accountId: "account-1",
          accountName: "Conta corrente",
        },
      ],
    });

    await expect(
      listTransactions(db, "user-1", { page: 2, limit: 25 }, { repository }),
    ).resolves.toEqual({
      items: [
        {
          id: "tx-1",
          description: "Salario",
          amount: "5000.00",
          currency: "BRL",
          kind: "income",
          occurredAt,
          origin: "manual",
          category: {
            id: "category-1",
            name: "Receita",
            color: "#16a34a",
          },
          account: {
            id: "account-1",
            name: "Conta corrente",
          },
        },
      ],
      total: 26,
      page: 2,
      hasNext: false,
    });
  });

  it("sets hasNext when more pages are available", async () => {
    const repository = makeRepository({ items: [], total: 51 });

    await expect(
      listTransactions(db, "user-1", { page: 2, limit: 25 }, { repository }),
    ).resolves.toMatchObject({ hasNext: true });
  });
});
