import { MinusIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type TrendDirection = "positive" | "negative" | "neutral";

type TrendIndicatorProps = Readonly<{
  value: number;
  direction?: TrendDirection;
  suffix?: string;
  className?: string;
}>;

function resolveTrendDirection(value: number): TrendDirection {
  if (value > 0) return "positive";
  if (value < 0) return "negative";
  return "neutral";
}

function formatTrendPercentage(value: number): string {
  const absoluteValue = Math.abs(value).toLocaleString("pt-BR", {
    maximumFractionDigits: 1,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
  });

  if (value === 0) return `${absoluteValue}%`;

  return `${value > 0 ? "+" : "-"}${absoluteValue}%`;
}

function TrendIndicator({
  value,
  direction = resolveTrendDirection(value),
  suffix,
  className,
}: TrendIndicatorProps) {
  const Icon =
    direction === "positive"
      ? TrendingUpIcon
      : direction === "negative"
        ? TrendingDownIcon
        : MinusIcon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium tabular-nums",
        direction === "positive" && "text-success",
        direction === "negative" && "text-danger",
        direction === "neutral" && "text-muted-foreground",
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      <span>{formatTrendPercentage(value)}</span>
      {suffix && (
        <span className="font-normal text-muted-foreground">{suffix}</span>
      )}
    </span>
  );
}

export { TrendIndicator, formatTrendPercentage };
export type { TrendDirection };
