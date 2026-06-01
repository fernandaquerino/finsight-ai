import type { ReactNode } from "react";
import { BarChart3 } from "lucide-react";

import { Card, CardHeader } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

type ChartCardProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  className?: string;
  children: ReactNode;
};

function ChartCard({
  title,
  subtitle,
  action,
  isLoading = false,
  isEmpty = false,
  emptyMessage = "Nenhum dado disponível para o período",
  className,
  children,
}: ChartCardProps) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader>
        <div>
          <p className="text-sm font-semibold text-card-foreground">{title}</p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </CardHeader>

      <div className="flex-1">
        {isLoading ? (
          <Skeleton className="h-60 w-full" />
        ) : isEmpty ? (
          <div
            className="flex h-60 flex-col items-center justify-center gap-2 text-muted-foreground"
            role="status"
            aria-label={emptyMessage}
          >
            <BarChart3 className="size-8 opacity-30" aria-hidden="true" />
            <p className="text-xs">{emptyMessage}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </Card>
  );
}

export { ChartCard };
