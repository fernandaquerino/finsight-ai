import { TransactionRow } from "@/features/transactions/components/TransactionRow";
import type { TransactionListItem } from "@/features/transactions/types";

type TransactionGroupByDateProps = Readonly<{
  label: string;
  transactions: TransactionListItem[];
  onSelect?: (id: string) => void;
  selectedId?: string;
}>;

function TransactionGroupByDate({
  label,
  transactions,
  onSelect,
  selectedId,
}: TransactionGroupByDateProps) {
  return (
    <section aria-labelledby={`transactions-${label}`} className="bg-card">
      <div className="border-t border-border bg-muted/45 px-4 py-3 first:border-t-0 sm:px-6">
        <h2
          id={`transactions-${label}`}
          className="text-[0.7rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase"
        >
          {label}
        </h2>
      </div>
      <ul aria-label={`Transações de ${label}`}>
        {transactions.map((transaction) => (
          <TransactionRow
            key={transaction.id}
            transaction={transaction}
            onSelect={onSelect}
            isSelected={transaction.id === selectedId}
          />
        ))}
      </ul>
    </section>
  );
}

export { TransactionGroupByDate };
