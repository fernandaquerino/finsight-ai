import { Suspense } from "react";

import {
  ChartCardSkeleton,
  MetricCardSkeleton,
} from "@/components/app/skeletons";
import { DashboardEmptyState } from "@/features/dashboard/components/DashboardEmptyState";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { DashboardHistory } from "@/features/dashboard/components/DashboardHistory";
import { DashboardMetrics } from "@/features/dashboard/components/DashboardMetrics";
import {
  monthParamLabel,
  monthParamToString,
  parseMonthParam,
} from "@/features/dashboard/month";
import { getDb } from "@/lib/db";
import { getCurrentUser, requireUserId } from "@/server/auth/session";
import { transactionRepository } from "@/server/repositories";

type DashboardPageProps = Readonly<{
  searchParams?: Promise<{ month?: string }>;
}>;

function MetricsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <MetricCardSkeleton />
      <MetricCardSkeleton />
      <MetricCardSkeleton />
    </div>
  );
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const userId = await requireUserId();
  const [user, params] = await Promise.all([getCurrentUser(), searchParams]);

  const hasTransactions = await transactionRepository.hasAny(getDb(), userId);

  if (!hasTransactions) {
    return (
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-7">
        <DashboardEmptyState />
      </main>
    );
  }

  const month = parseMonthParam(params?.month);
  const monthLabel = monthParamLabel(month);
  const monthKey = monthParamToString(month);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-7">
      <DashboardHeader
        name={user?.name}
        month={month}
        monthLabel={monthLabel}
      />

      <Suspense key={monthKey} fallback={<MetricsSkeleton />}>
        <DashboardMetrics
          userId={userId}
          month={month}
          monthLabel={monthLabel}
        />
      </Suspense>

      <Suspense fallback={<ChartCardSkeleton />}>
        <DashboardHistory userId={userId} />
      </Suspense>
    </main>
  );
}
