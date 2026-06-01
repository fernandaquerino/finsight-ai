import { ChartCard } from "@/components/app/ChartCard";
import { BarChart } from "@/components/charts/BarChart";
import {
  MOCK_BAR_DATA,
  type BarDataPoint,
} from "@/features/dashboard/types/dashboard.types";
import { CHART_COLORS } from "@/lib/chart-colors";

type BarChartCardProps = {
  data?: BarDataPoint[];
  isLoading?: boolean;
  isEmpty?: boolean;
  className?: string;
};

function BarChartCard({
  data = MOCK_BAR_DATA,
  isLoading = false,
  isEmpty = false,
  className,
}: BarChartCardProps) {
  return (
    <ChartCard
      title="Receitas vs. despesas"
      subtitle="Últimos 6 meses"
      isLoading={isLoading}
      isEmpty={isEmpty}
      className={className}
    >
      <BarChart
        data={data}
        height={220}
        labelFormatter={(month) => `${month} · 2026`}
        aria-label="Gráfico de barras de receitas e despesas dos últimos 6 meses"
      />
      <div className="mt-3 flex items-center justify-center gap-6">
        <div className="flex items-center gap-1.5">
          <span
            className="size-2.5 rounded-sm"
            style={{ background: CHART_COLORS.success }}
            aria-hidden="true"
          />
          <span className="text-xs text-muted-foreground">Receitas</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="size-2.5 rounded-sm"
            style={{ background: CHART_COLORS.danger }}
            aria-hidden="true"
          />
          <span className="text-xs text-muted-foreground">Despesas</span>
        </div>
      </div>
    </ChartCard>
  );
}

export { BarChartCard };
