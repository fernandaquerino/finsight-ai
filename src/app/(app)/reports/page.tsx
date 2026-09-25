import {
  monthParamToString,
  parseMonthParam,
} from "@/features/dashboard/month";
import { ReportsScreen } from "@/features/reports/components/ReportsScreen";
import type { ReportGranularity } from "@/features/reports/types";

export const metadata = {
  title: "Relatórios · FinSight AI",
  description: "Análises por período e exportação dos seus dados.",
};

type ReportsPageProps = Readonly<{
  searchParams: Promise<{ granularity?: string; month?: string }>;
}>;

// ?granularity=monthly|quarterly|yearly e ?month=YYYY-MM.
// Inválido/ausente → mensal no mês corrente.
function parseGranularity(value: string | undefined): ReportGranularity {
  return value === "quarterly" || value === "yearly" ? value : "monthly";
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const { granularity, month } = await searchParams;

  return (
    <ReportsScreen
      initialGranularity={parseGranularity(granularity)}
      initialMonth={monthParamToString(parseMonthParam(month))}
    />
  );
}
