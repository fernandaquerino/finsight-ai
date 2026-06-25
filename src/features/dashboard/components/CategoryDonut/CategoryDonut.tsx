import { DonutChartCard } from "@/features/dashboard/components/DonutChartCard";
import {
  monthParamToPeriodQuery,
  type MonthParam,
} from "@/features/dashboard/month";
import { getDb } from "@/lib/db";
import { getCategoryBreakdown } from "@/server/services/dashboard/category-breakdown";
import { resolvePeriod } from "@/server/services/dashboard/period";

type CategoryDonutProps = Readonly<{
  userId: string;
  month: MonthParam;
}>;

export async function CategoryDonut({ userId, month }: CategoryDonutProps) {
  const period = resolvePeriod(monthParamToPeriodQuery(month));
  const slices = await getCategoryBreakdown(getDb(), userId, period);

  return <DonutChartCard data={slices} isEmpty={slices.length === 0} />;
}
