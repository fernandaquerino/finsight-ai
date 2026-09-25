"use client";

import { EllipsisIcon, PencilIcon, Trash2Icon } from "lucide-react";

import { MoneyText } from "@/components/app/MoneyText";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { IconButton } from "@/components/ui/IconButton";
import type {
  BudgetStatus,
  CategorySummaryItem,
} from "@/features/categories/types";
import { CategoryIcon } from "@/lib/categories/category-icons";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

type CategoryCardProps = Readonly<{
  category: CategorySummaryItem;
  canDelete: boolean;
  onEdit: (category: CategorySummaryItem) => void;
  onDelete: (category: CategorySummaryItem) => void;
}>;

const statusBarClassName: Record<BudgetStatus, string> = {
  none: "bg-muted",
  ok: "bg-success",
  warning: "bg-warning",
  over: "bg-danger",
};

function pluralizeTransactions(count: number): string {
  return count === 1 ? "1 transação" : `${count} transações`;
}

function BudgetProgress({ category }: { category: CategorySummaryItem }) {
  const { monthlyBudget, budgetUsage, budgetStatus, amount } = category;

  if (monthlyBudget === null || budgetUsage === null) {
    return (
      <p className="text-xs text-muted-foreground">
        {category.kind === "expense"
          ? "Sem orçamento definido"
          : "Receita — sem orçamento"}
      </p>
    );
  }

  const percent = Math.round(budgetUsage * 100);
  const remaining = monthlyBudget - amount;

  return (
    <div className="space-y-1.5">
      <div
        role="progressbar"
        aria-label={`Uso do orçamento de ${category.name}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.min(percent, 100)}
        aria-valuetext={`${percent}% de ${formatMoney(monthlyBudget)}`}
        className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width]",
            statusBarClassName[budgetStatus],
          )}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-mono text-muted-foreground tabular-nums">
          {percent}% de {formatMoney(monthlyBudget)}
        </span>
        <span
          className={cn(
            "font-medium",
            budgetStatus === "over" && "text-danger",
            budgetStatus === "warning" && "text-warning",
            budgetStatus === "ok" && "text-muted-foreground",
          )}
        >
          {remaining >= 0
            ? `Restam ${formatMoney(remaining)}`
            : `${formatMoney(Math.abs(remaining))} acima`}
        </span>
      </div>
    </div>
  );
}

function CategoryCard({
  category,
  canDelete,
  onEdit,
  onDelete,
}: CategoryCardProps) {
  return (
    <article
      aria-labelledby={`category-${category.id}-name`}
      className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 shadow-card"
    >
      <header className="flex items-start gap-3">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-md"
          style={{
            backgroundColor: `${category.color}1F`,
            color: category.color,
          }}
          aria-hidden="true"
        >
          <CategoryIcon categoryKey={category.icon} className="size-[18px]" />
        </span>
        <div className="min-w-0 flex-1">
          <h3
            id={`category-${category.id}-name`}
            className="truncate text-sm font-semibold text-foreground"
          >
            {category.name}
          </h3>
          <p className="text-xs text-muted-foreground">
            {pluralizeTransactions(category.monthTransactionCount)} no mês
          </p>
        </div>
        {/* modal={false}: evita o foco/pointer-events presos ao abrir um
            Dialog a partir de um item do menu (issue conhecida do Radix). */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <IconButton
              size="sm"
              aria-label={`Ações da categoria ${category.name}`}
            >
              <EllipsisIcon />
            </IconButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onEdit(category)}>
              <PencilIcon aria-hidden="true" />
              Editar
            </DropdownMenuItem>
            {canDelete ? (
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => onDelete(category)}
              >
                <Trash2Icon aria-hidden="true" />
                Excluir
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <MoneyText
        value={category.amount}
        tone="neutral"
        className="text-xl leading-none font-semibold"
      />

      <BudgetProgress category={category} />
    </article>
  );
}

export { CategoryCard };
