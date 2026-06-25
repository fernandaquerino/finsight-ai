import Link from "next/link";
import {
  ArrowDownRight,
  ArrowLeftRight,
  ArrowUpRight,
  ChevronRight,
} from "lucide-react";

import { CategoryBadge } from "@/components/app/CategoryBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { buttonVariants } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { appRoutes } from "@/lib/app-routes";
import { formatShortDate } from "@/lib/date";
import { getDb } from "@/lib/db";
import { formatMoney, formatSignedMoney } from "@/lib/money";
import { transactionRepository } from "@/server/repositories";
import { cn } from "@/lib/utils";

const RECENT_LIMIT = 5;

const KIND_ICON = {
  income: ArrowUpRight,
  expense: ArrowDownRight,
  transfer: ArrowLeftRight,
} as const;

const KIND_ICON_CLASS = {
  income: "bg-success-soft text-success",
  expense: "bg-danger-soft text-danger",
  transfer: "bg-muted text-muted-foreground",
} as const;

type RecentTransactionsProps = Readonly<{
  userId: string;
}>;

function formatAmount(kind: keyof typeof KIND_ICON, amount: string): string {
  const value = Number(amount);
  if (kind === "transfer") {
    return formatMoney(value, { signDisplay: "never" });
  }
  return formatSignedMoney(kind === "expense" ? -value : value);
}

export async function RecentTransactions({ userId }: RecentTransactionsProps) {
  const rows = await transactionRepository.listRecentWithRelations(
    getDb(),
    userId,
    RECENT_LIMIT,
  );

  return (
    <Card className="flex flex-col">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-card-foreground">
          Transações recentes
        </p>
        <Link
          href={appRoutes.transactions}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "gap-0.5 text-xs text-muted-foreground",
          )}
        >
          Ver todas
          <ChevronRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          variant="transactions"
          title="Nenhuma transação ainda"
          className="border-0 py-10"
        />
      ) : (
        <ul className="divide-y divide-border" aria-label="Transações recentes">
          {rows.map((row) => {
            const Icon = KIND_ICON[row.kind];
            const tone =
              row.kind === "income"
                ? "text-success"
                : row.kind === "expense"
                  ? "text-danger"
                  : "text-foreground";

            return (
              <li key={row.id} className="flex items-center gap-3 py-3">
                <div
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full",
                    KIND_ICON_CLASS[row.kind],
                  )}
                  aria-hidden="true"
                >
                  <Icon className="size-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {row.description ?? row.categoryName ?? "Transação"}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <CategoryBadge category={row.categoryName ?? "Outros"} />
                    <span className="text-xs text-muted-foreground">
                      {formatShortDate(new Date(row.occurredAt))}
                      {row.accountName ? ` · ${row.accountName}` : ""}
                    </span>
                  </div>
                </div>

                <span
                  className={cn(
                    "shrink-0 font-mono text-sm font-semibold tabular-nums",
                    tone,
                  )}
                >
                  {formatAmount(row.kind, row.amount)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
