import {
  ArrowLeftRightIcon,
  ArrowUpRightIcon,
  CarIcon,
  HeartIcon,
  HomeIcon,
  ReceiptTextIcon,
  Repeat2Icon,
  UtensilsIcon,
} from "lucide-react";

import { MoneyText } from "@/components/app/MoneyText";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type {
  TransactionKind,
  TransactionListItem,
} from "@/features/transactions/types";

type TransactionRowProps = Readonly<{
  transaction: TransactionListItem;
}>;

const kindIconClass = {
  income: "bg-success-soft text-success",
  expense: "bg-danger-soft text-danger",
  transfer: "bg-muted text-muted-foreground",
} as const;

const monthLabels = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
] as const;

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

function normalizeCategoryName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function CategoryIcon({
  categoryName,
  kind,
}: Readonly<{
  categoryName: string;
  kind: TransactionKind;
}>) {
  const normalized = normalizeCategoryName(categoryName);
  const className = "size-[18px]";

  if (normalized.includes("aliment")) {
    return <UtensilsIcon className={className} />;
  }
  if (normalized.includes("transporte")) {
    return <CarIcon className={className} />;
  }
  if (normalized.includes("moradia") || normalized.includes("aluguel")) {
    return <HomeIcon className={className} />;
  }
  if (normalized.includes("assinatura")) {
    return <Repeat2Icon className={className} />;
  }
  if (normalized.includes("saude")) {
    return <HeartIcon className={className} />;
  }
  if (kind === "income") {
    return <ArrowUpRightIcon className={className} />;
  }
  if (kind === "transfer") {
    return <ArrowLeftRightIcon className={className} />;
  }

  return <ReceiptTextIcon className={className} />;
}

function formatTransactionDate(date: Date): string {
  return `${date.getDate()} ${monthLabels[date.getMonth()]}`;
}

function TransactionRow({ transaction }: TransactionRowProps) {
  const signedAmount = getSignedAmount(transaction.kind, transaction.amount);
  const occurredAt = new Date(transaction.occurredAt);
  const categoryName = transaction.category?.name ?? "Sem categoria";
  const categoryColor =
    transaction.category?.color ??
    (transaction.kind === "income" ? "hsl(var(--success))" : undefined);
  const iconStyle = categoryColor
    ? {
        backgroundColor: `color-mix(in srgb, ${categoryColor} 14%, transparent)`,
        color: categoryColor,
      }
    : undefined;

  return (
    <li className="grid min-h-[72px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-t border-border px-4 py-3 first:border-t-0 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-lg",
            !iconStyle && kindIconClass[transaction.kind],
          )}
          style={iconStyle}
          aria-hidden="true"
        >
          <CategoryIcon categoryName={categoryName} kind={transaction.kind} />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm leading-tight font-medium text-foreground">
            {transaction.description ?? categoryName}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm leading-tight text-muted-foreground">
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
          {formatTransactionDate(occurredAt)}
        </p>
      </div>
    </li>
  );
}

export { TransactionRow, getSignedAmount, formatTransactionDate };
