import type { NewTransaction } from "@/../db/schema";
import { transactionRepository, type Database } from "@/server/repositories";
import { invalidateDashboardCache } from "@/server/services/dashboard/cache";

// Mutações de transação passam por aqui para garantir que o cache do dashboard
// seja invalidado em qualquer escrita. Os endpoints de CRUD de transação (épico
// próprio) devem usar estas funções em vez do repositório diretamente.
//
// `invalidate` é injetável para teste; em produção usa o cache real.
type Deps = {
  invalidate?: (userId: string) => Promise<void>;
};

export async function createTransaction(
  db: Database,
  data: NewTransaction,
  { invalidate = invalidateDashboardCache }: Deps = {},
) {
  const created = await transactionRepository.create(db, data);
  await invalidate(created.userId);
  return created;
}

export async function deleteTransaction(
  db: Database,
  userId: string,
  id: string,
  { invalidate = invalidateDashboardCache }: Deps = {},
) {
  const deleted = await transactionRepository.softDelete(db, userId, id);
  if (deleted) {
    await invalidate(userId);
  }
  return deleted;
}
