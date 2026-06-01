import type { ElementType } from "react";
import {
  Banknote,
  Car,
  Gamepad2,
  Heart,
  Home,
  ReceiptText,
  RefreshCw,
  Utensils,
} from "lucide-react";

import type {
  Transaction,
  TransactionCategory,
} from "@/features/dashboard/types/dashboard.types";
import { cn } from "@/lib/utils";

type CategoryConfig = {
  icon: ElementType;
  className: string;
};

const CATEGORY_CONFIG: Record<TransactionCategory, CategoryConfig> = {
  alimentacao: { icon: Utensils,    className: "bg-warning-soft text-warning" },
  transporte:  { icon: Car,         className: "bg-info-soft text-info" },
  assinatura:  { icon: RefreshCw,   className: "bg-primary-soft text-primary" },
  moradia:     { icon: Home,        className: "bg-success-soft text-success" },
  salario:     { icon: Banknote,    className: "bg-success-soft text-success" },
  lazer:       { icon: Gamepad2,    className: "bg-danger-soft text-danger" },
  saude:       { icon: Heart,       className: "bg-danger-soft text-danger" },
  outro:       { icon: ReceiptText, className: "bg-muted text-muted-foreground" },
};

function formatAmount(amount: number): string {
  const abs = Math.abs(amount).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  return amount >= 0 ? `+${abs}` : `-${abs}`;
}

type TransactionListItemProps = {
  transaction: Transaction;
};

function TransactionListItem({ transaction }: TransactionListItemProps) {
  const { name, source, date, amount, category } = transaction;
  const config = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.outro;
  const Icon = config.icon;
  const isPositive = amount >= 0;
  const formattedAmount = formatAmount(amount);

  return (
    <li className="flex items-center gap-3 py-3">
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full",
          config.className,
        )}
        aria-hidden="true"
      >
        <Icon className="size-4" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{name}</p>
        <p className="text-xs text-muted-foreground">
          {date} · {source}
        </p>
      </div>

      <span
        className={cn(
          "shrink-0 text-sm font-medium tabular-nums",
          isPositive ? "text-success" : "text-foreground",
        )}
        aria-label={`${isPositive ? "Crédito" : "Débito"} de ${formattedAmount}`}
      >
        {formattedAmount}
      </span>
    </li>
  );
}

export { TransactionListItem, formatAmount };
