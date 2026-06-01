import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";
import { formatMoney, formatSignedMoney } from "@/lib/money";

type MoneyTone = "auto" | "positive" | "negative" | "neutral";

type MoneyTextProps = Readonly<
  Omit<ComponentPropsWithoutRef<"span">, "children"> & {
    value: number;
    tone?: MoneyTone;
    showSign?: boolean;
  }
>;

function resolveTone(
  value: number,
  tone: MoneyTone,
): Exclude<MoneyTone, "auto"> {
  if (tone !== "auto") return tone;
  if (value > 0) return "positive";
  if (value < 0) return "negative";
  return "neutral";
}

function MoneyText({
  value,
  tone = "auto",
  showSign = false,
  className,
  ...props
}: MoneyTextProps) {
  const resolvedTone = resolveTone(value, tone);
  const formattedValue = showSign
    ? formatSignedMoney(value)
    : formatMoney(value);

  return (
    <span
      className={cn(
        "font-mono tabular-nums",
        resolvedTone === "positive" && "text-success",
        resolvedTone === "negative" && "text-danger",
        resolvedTone === "neutral" && "text-foreground",
        className,
      )}
      {...props}
    >
      {formattedValue}
    </span>
  );
}

export { MoneyText };
