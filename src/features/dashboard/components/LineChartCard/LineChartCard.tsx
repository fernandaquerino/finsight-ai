import { TrendingUp } from "lucide-react";

import { ChartCard } from "@/components/app/ChartCard";
import { LineChart } from "@/components/charts/LineChart";
import {
  MOCK_LINE_DATA,
  type LineDataPoint,
} from "@/features/dashboard/types/dashboard.types";
import { cn } from "@/lib/utils";

type LineChartCardProps = {
  data?: LineDataPoint[];
  subtitle?: string;
  trend?: string;
  trendUp?: boolean;
  isLoading?: boolean;
  isEmpty?: boolean;
  className?: string;
  // Formats the X-axis day label in the tooltip. Defaults to "DD/MM" for May.
  labelFormatter?: (day: string) => string;
};

function LineChartCard({
  data = MOCK_LINE_DATA,
  subtitle = "Atualizado hoje",
  trend = "+4,2%",
  trendUp = true,
  isLoading = false,
  isEmpty = false,
  className,
  labelFormatter = (day) => `${day}/05`,
}: LineChartCardProps) {
  return (
    <ChartCard
      title="Saldo ao longo do mês"
      subtitle={subtitle}
      isLoading={isLoading}
      isEmpty={isEmpty}
      className={className}
      action={
        <div
          className={cn(
            "flex items-center gap-1 text-xs font-medium",
            trendUp ? "text-success" : "text-warning",
          )}
        >
          <TrendingUp className="size-3.5" aria-hidden="true" />
          <span>{trend}</span>
        </div>
      }
    >
      <LineChart
        data={data}
        height={240}
        labelFormatter={labelFormatter}
        aria-label="Gráfico de saldo ao longo do mês"
      />
    </ChartCard>
  );
}

export { LineChartCard };
