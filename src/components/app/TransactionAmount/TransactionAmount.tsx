import { MoneyText } from "@/components/app/MoneyText";
import { cn } from "@/lib/utils";
import { formatSignedMoney } from "@/lib/money";

type TransactionAmountType = "income" | "expense" | "neutral";

type TransactionAmountProps = Readonly<{
  value: number;
  type?: TransactionAmountType;
  ariaLabel?: string;
  className?: string;
}>;

function normalizeTransactionValue(
  value: number,
  type: TransactionAmountType,
): number {
  if (type === "income") return Math.abs(value);
  if (type === "expense") return -Math.abs(value);
  return value;
}

function resolveTransactionType(value: number): TransactionAmountType {
  if (value > 0) return "income";
  if (value < 0) return "expense";
  return "neutral";
}

function TransactionAmount({
  value,
  type = resolveTransactionType(value),
  ariaLabel,
  className,
}: TransactionAmountProps) {
  const normalizedValue = normalizeTransactionValue(value, type);
  const label =
    type === "income" ? "Receita" : type === "expense" ? "Despesa" : "Valor";

  return (
    <MoneyText
      value={normalizedValue}
      showSign
      tone={type === "income" ? "positive" : "neutral"}
      className={cn("text-sm font-medium", className)}
      aria-label={
        ariaLabel ?? `${label} de ${formatSignedMoney(normalizedValue)}`
      }
    />
  );
}

export { TransactionAmount };
export type { TransactionAmountType };
