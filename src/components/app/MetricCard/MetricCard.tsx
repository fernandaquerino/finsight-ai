import type { ElementType } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";

import {
  Card,
  CardContent,
  CardEyebrow,
  CardHeader,
} from "@/components/ui/Card";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: string;
  // trend/trendUp são opcionais: nem toda métrica tem comparação de período.
  // Quando ausentes, a linha de tendência não é renderizada.
  trend?: string;
  trendUp?: boolean;
  // Texto de apoio que NÃO é uma comparação de período (ex.: "de R$ 31.500,00",
  // o nome do maior gasto). Renderiza sem seta e sem cor de tendência, para não
  // sugerir alta ou queda onde não há. Pode acompanhar `trend`.
  caption?: string;
  icon: ElementType;
  iconClassName?: string;
  variant?: "default" | "ai";
};

function MetricCard({
  label,
  value,
  trend,
  trendUp = false,
  caption,
  icon: Icon,
  iconClassName,
  variant = "default",
}: MetricCardProps) {
  const TrendIcon = trendUp ? TrendingUp : TrendingDown;

  return (
    <Card variant={variant} padding="sm" className="hover:shadow-pop">
      <CardHeader>
        <CardEyebrow>{label}</CardEyebrow>
        <div
          className={cn(
            "flex items-center justify-center rounded-md p-1.5",
            iconClassName ?? "bg-muted text-muted-foreground",
          )}
          aria-hidden="true"
        >
          <Icon className="size-4" />
        </div>
      </CardHeader>

      <CardContent className="space-y-1">
        <p className="font-mono text-2xl font-bold tracking-tight text-card-foreground tabular-nums">
          {value}
        </p>
        {caption && <p className="text-xs text-muted-foreground">{caption}</p>}
        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium",
              trendUp ? "text-success" : "text-warning",
            )}
          >
            <TrendIcon className="size-3.5 shrink-0" aria-hidden="true" />
            <span>{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { MetricCard };
