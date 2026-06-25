import { BarChartCard } from "@/features/dashboard/components/BarChartCard";
import { getDb } from "@/lib/db";
import { getMonthlyHistory } from "@/server/services/dashboard/monthly-history";

type DashboardHistoryProps = Readonly<{
  userId: string;
}>;

export async function DashboardHistory({ userId }: DashboardHistoryProps) {
  const series = await getMonthlyHistory(getDb(), userId);
  const isEmpty = series.every(
    (point) => point.receitas === 0 && point.despesas === 0,
  );

  return <BarChartCard data={series} isEmpty={isEmpty} />;
}
