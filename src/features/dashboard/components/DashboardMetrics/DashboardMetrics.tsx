import { ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";

import { MetricCard } from "@/components/app/MetricCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import { getDb } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { getDashboardSummary } from "@/server/services/dashboard/get-dashboard-summary";
import { resolvePeriod } from "@/server/services/dashboard/period";
import {
  monthParamToPeriodQuery,
  type MonthParam,
} from "@/features/dashboard/month";

type DashboardMetricsProps = Readonly<{
  userId: string;
  month: MonthParam;
  monthLabel: string;
}>;

export async function DashboardMetrics({
  userId,
  month,
  monthLabel,
}: DashboardMetricsProps) {
  const period = resolvePeriod(monthParamToPeriodQuery(month));
  const summary = await getDashboardSummary(getDb(), userId, period);
  const { income, expenses, balance } = summary.metrics;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="Receitas no mês"
          value={formatMoney(income)}
          icon={ArrowUpRight}
          iconClassName="bg-success-soft text-success"
        />
        <MetricCard
          label="Despesas no mês"
          value={formatMoney(expenses)}
          icon={ArrowDownRight}
          iconClassName="bg-warning-soft text-warning"
        />
        <MetricCard
          label="Saldo do mês"
          value={formatMoney(balance)}
          icon={Wallet}
          iconClassName="bg-muted text-foreground"
        />
      </div>

      {summary.transactionCount === 0 && (
        <EmptyState
          variant="chart"
          title={`Sem movimentações em ${monthLabel}`}
          description="Lance uma transação ou troque o período acima para ver seus números."
          className="bg-card"
        />
      )}
    </div>
  );
}
