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
  trend: string;
  trendUp: boolean;
  icon: ElementType;
  iconClassName?: string;
  variant?: "default" | "ai";
};

function MetricCard({
  label,
  value,
  trend,
  trendUp,
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
        <div
          className={cn(
            "flex items-center gap-1 text-xs font-medium",
            trendUp ? "text-success" : "text-warning",
          )}
        >
          <TrendIcon className="size-3.5 shrink-0" aria-hidden="true" />
          <span>{trend}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export { MetricCard };
