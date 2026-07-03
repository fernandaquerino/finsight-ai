import { TransactionGroupByDate } from "@/features/transactions/components/TransactionGroupByDate";
import type { TransactionListItem } from "@/features/transactions/types";

type TransactionGroup = {
  key: string;
  label: string;
  transactions: TransactionListItem[];
};

type TransactionListProps = Readonly<{
  transactions: TransactionListItem[];
  now?: Date;
  onSelect?: (id: string) => void;
  selectedId?: string;
}>;

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function formatGroupLabel(date: Date, now: Date): string {
  const dateKey = toDateKey(date);

  if (dateKey === toDateKey(now)) {
    return "Hoje";
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (dateKey === toDateKey(yesterday)) {
    return "Ontem";
  }

  const dayInMs = 24 * 60 * 60 * 1000;
  const diffInDays = Math.round(
    (startOfDay(now).getTime() - startOfDay(date).getTime()) / dayInMs,
  );

  if (diffInDays > 1 && diffInDays <= 7) {
    return "Semana passada";
  }

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: date.getFullYear() === now.getFullYear() ? undefined : "numeric",
  });
}

export function groupTransactionsByDate(
  transactions: TransactionListItem[],
  now: Date = new Date(),
): TransactionGroup[] {
  const groups = new Map<string, TransactionGroup>();
  const sorted = [...transactions].sort(
    (a, b) =>
      new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );

  for (const transaction of sorted) {
    const date = new Date(transaction.occurredAt);
    const label = formatGroupLabel(date, now);
    const key = label === "Semana passada" ? "last-week" : toDateKey(date);
    const group = groups.get(key);

    if (group) {
      group.transactions.push(transaction);
      continue;
    }

    groups.set(key, {
      key,
      label,
      transactions: [transaction],
    });
  }

  return Array.from(groups.values());
}

function TransactionList({
  transactions,
  now,
  onSelect,
  selectedId,
}: TransactionListProps) {
  const groups = groupTransactionsByDate(transactions, now);

  return (
    <div className="overflow-hidden rounded-lg border border-t-0 border-border bg-card shadow-card">
      {groups.map((group) => (
        <TransactionGroupByDate
          key={group.key}
          label={group.label}
          transactions={group.transactions}
          onSelect={onSelect}
          selectedId={selectedId}
        />
      ))}
    </div>
  );
}

export { TransactionList };
