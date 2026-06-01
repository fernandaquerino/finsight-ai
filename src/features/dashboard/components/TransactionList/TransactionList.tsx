import { ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { TransactionListItem } from "@/features/dashboard/components/TransactionListItem";
import {
  MOCK_TRANSACTIONS,
  type Transaction,
} from "@/features/dashboard/types/dashboard.types";
import { cn } from "@/lib/utils";

type TransactionListProps = {
  transactions?: Transaction[];
  isLoading?: boolean;
  className?: string;
};

function TransactionList({
  transactions = MOCK_TRANSACTIONS,
  isLoading = false,
  className,
}: TransactionListProps) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-card-foreground">
          Transações recentes
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="group gap-0.5 text-xs text-muted-foreground"
        >
          Ver todas
          <ChevronRight
            className="size-3.5 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Button>
      </div>

      {isLoading ? (
        <ul
          className="space-y-3"
          aria-busy="true"
          aria-label="Carregando transações"
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="flex items-center gap-3 py-1">
              <Skeleton className="size-9 shrink-0 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-2.5 w-1/2" />
              </div>
              <Skeleton className="h-3 w-16 shrink-0" />
            </li>
          ))}
        </ul>
      ) : transactions.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-10 text-xs text-muted-foreground">
          Nenhuma transação no período
        </div>
      ) : (
        <ul className="divide-y divide-border" aria-label="Transações recentes">
          {transactions.map((t) => (
            <TransactionListItem key={t.id} transaction={t} />
          ))}
        </ul>
      )}
    </Card>
  );
}

export { TransactionList };
