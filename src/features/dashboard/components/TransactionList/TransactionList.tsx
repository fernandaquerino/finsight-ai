import { ChevronRight } from "lucide-react";

import { EmptyState } from "@/components/feedback/EmptyState";
import { TransactionListSkeleton } from "@/components/app/skeletons";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
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
        <TransactionListSkeleton />
      ) : transactions.length === 0 ? (
        <EmptyState
          variant="transactions"
          title="Nenhuma transação no período"
          className="border-0 py-10"
        />
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
