import { DashboardEmptyState } from "@/features/dashboard/components/DashboardEmptyState";
import { DashboardView } from "@/features/dashboard/components/DashboardView";
import { getDb } from "@/lib/db";
import { requireUserId } from "@/server/auth/session";
import { transactionRepository } from "@/server/repositories";

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export default async function DashboardPage() {
  const userId = await requireUserId();
  const hasTransactions = await transactionRepository.hasAny(getDb(), userId);

  // Snapshot da data do servidor (YYYY-MM-DD) enviado junto com o HTML para
  // evitar hydration mismatch: o client inicializa o estado com o mesmo valor
  // em vez de chamar new Date() no primeiro render.
  const now = new Date();
  const initialDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    now.getDate(),
  )}`;

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-7">
      {hasTransactions ? (
        <DashboardView initialDate={initialDate} />
      ) : (
        <DashboardEmptyState />
      )}
    </main>
  );
}
