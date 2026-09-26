import Link from "next/link";

import { AIInsightBanner } from "@/components/app/AIInsightBanner";
import { Button } from "@/components/ui/Button";
import { getDb } from "@/lib/db";
import { appRoutes } from "@/lib/app-routes";
import { formatMoney } from "@/lib/money";
import { getInsightsSummary } from "@/server/services/insights/summary";

type DashboardInsightBannerProps = Readonly<{
  userId: string;
  month?: string;
}>;

// Server Component: lê o insight de maior prioridade do mês e mostra no topo do
// dashboard. Sem insight, não renderiza nada — banner vazio só ocuparia espaço.
// A leitura é a mesma do /api/insights e compartilha o cache Redis.
async function DashboardInsightBanner({
  userId,
  month,
}: DashboardInsightBannerProps) {
  const summary = await getInsightsSummary(getDb(), userId, month);
  const [topInsight] = summary.items;

  if (!topInsight) return null;

  const metric =
    summary.totals.potentialAnnualSavings > 0
      ? {
          label: "Economia potencial",
          value: `${formatMoney(summary.totals.potentialAnnualSavings)}/ano`,
        }
      : undefined;

  const remaining = summary.counts.all - 1;

  return (
    <AIInsightBanner
      title={topInsight.title}
      description={topInsight.reason}
      source={topInsight.source}
      metric={metric}
      actionSlot={
        <Button variant="secondary" size="sm" asChild>
          <Link href={appRoutes.insights}>
            {remaining > 0
              ? `Ver este e outros ${remaining} insights`
              : "Ver o insight completo"}
          </Link>
        </Button>
      }
    />
  );
}

export { DashboardInsightBanner };
