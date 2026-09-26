import { redirect } from "next/navigation";

import { AppShell } from "@/components/app/AppShell";
import { insightsToNotifications } from "@/features/insights/notifications";
import { appRoutes } from "@/lib/app-routes";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/server/auth/session";
import { userProfileRepository } from "@/server/repositories";
import { formatMonthKey } from "@/server/services/insights/detectors";
import { getInsightsSummary } from "@/server/services/insights/summary";

type AppLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default async function AppLayout({ children }: AppLayoutProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Força o onboarding antes de qualquer tela autenticada. /onboarding fica
  // fora do grupo (app), então não há loop de redirecionamento.
  const db = getDb();
  const profile = await userProfileRepository.getByUserId(db, user.id);

  if (!profile?.onboardingCompletedAt) {
    redirect("/onboarding");
  }

  // O shell precisa dos insights para o indicador da sidebar e para a central
  // de notificações. É a mesma leitura do /api/insights e compartilha o cache
  // Redis, então não vira uma consulta extra por página navegada.
  const insights = await getInsightsSummary(db, user.id);

  return (
    <AppShell
      user={user}
      indicatorRoutes={insights.counts.all > 0 ? [appRoutes.insights] : []}
      notifications={insightsToNotifications(
        insights.items,
        formatMonthKey(insights.month),
      )}
    >
      {children}
    </AppShell>
  );
}
