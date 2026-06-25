import { MoneyText } from "@/components/app/MoneyText";
import { TransactionRow } from "@/features/transactions/components/TransactionRow";
import type { TransactionListItem } from "@/features/transactions/types";

type TransactionGroupByDateProps = Readonly<{
  label: string;
  transactions: TransactionListItem[];
}>;

function getSignedAmount(transaction: TransactionListItem): number {
  const amount = Number(transaction.amount);

  if (transaction.kind === "expense") {
    return -Math.abs(amount);
  }

  if (transaction.kind === "income") {
    return Math.abs(amount);
  }

  return amount;
}

function TransactionGroupByDate({
  label,
  transactions,
}: TransactionGroupByDateProps) {
  const dailyTotal = transactions.reduce(
    (total, transaction) => total + getSignedAmount(transaction),
    0,
  );

  return (
    <section aria-labelledby={`transactions-${label}`} className="bg-card">
      <div className="flex items-center justify-between border-t border-border bg-muted/40 px-4 py-3 first:border-t-0 sm:px-6">
        <h2
          id={`transactions-${label}`}
          className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase"
        >
          {label}
        </h2>
        <MoneyText
          value={dailyTotal}
          showSign
          tone={dailyTotal > 0 ? "positive" : "neutral"}
          className="text-xs font-semibold"
          aria-label={`Total de ${label}`}
        />
      </div>
      <ul aria-label={`Transações de ${label}`}>
        {transactions.map((transaction) => (
          <TransactionRow key={transaction.id} transaction={transaction} />
        ))}
      </ul>
    </section>
  );
}

export { TransactionGroupByDate };
