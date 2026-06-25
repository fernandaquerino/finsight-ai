import {
  ArrowDownRightIcon,
  ArrowLeftRightIcon,
  ArrowUpRightIcon,
  ReceiptTextIcon,
} from "lucide-react";

import { MoneyText } from "@/components/app/MoneyText";
import { Badge } from "@/components/ui/Badge";
import { formatShortDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import type {
  TransactionKind,
  TransactionListItem,
} from "@/features/transactions/types";

type TransactionRowProps = Readonly<{
  transaction: TransactionListItem;
}>;

const kindIcon = {
  income: ArrowUpRightIcon,
  expense: ArrowDownRightIcon,
  transfer: ArrowLeftRightIcon,
} as const;

const kindIconClass = {
  income: "bg-success-soft text-success",
  expense: "bg-danger-soft text-danger",
  transfer: "bg-muted text-muted-foreground",
} as const;

function getSignedAmount(kind: TransactionKind, amount: string): number {
  const value = Number(amount);

  if (kind === "expense") {
    return -Math.abs(value);
  }

  if (kind === "income") {
    return Math.abs(value);
  }

  return value;
}

function TransactionRow({ transaction }: TransactionRowProps) {
  const Icon = kindIcon[transaction.kind] ?? ReceiptTextIcon;
  const signedAmount = getSignedAmount(transaction.kind, transaction.amount);
  const occurredAt = new Date(transaction.occurredAt);
  const categoryName = transaction.category?.name ?? "Sem categoria";

  return (
    <li className="grid min-h-[76px] grid-cols-[1fr_auto] items-center gap-4 border-t border-border px-4 py-3 first:border-t-0 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg",
            kindIconClass[transaction.kind],
          )}
          aria-hidden="true"
        >
          <Icon className="size-4" />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {transaction.description ?? categoryName}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              {transaction.category?.color ? (
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: transaction.category.color }}
                  aria-hidden="true"
                />
              ) : null}
              {categoryName}
            </span>
            <span aria-hidden="true">·</span>
            <span>{transaction.account.name ?? "Conta"}</span>
            {transaction.origin === "manual" ? (
              <Badge variant="secondary" className="h-5 px-1.5 text-[11px]">
                Manual
              </Badge>
            ) : null}
          </div>
        </div>
      </div>

      <div className="text-right">
        <MoneyText
          value={signedAmount}
          showSign
          tone={signedAmount > 0 ? "positive" : "neutral"}
          className="text-sm font-semibold"
        />
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatShortDate(occurredAt)}
        </p>
      </div>
    </li>
  );
}

export { TransactionRow, getSignedAmount };
