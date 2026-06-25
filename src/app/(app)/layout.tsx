import { redirect } from "next/navigation";

import { AppShell } from "@/components/app/AppShell";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/server/auth/session";
import { userProfileRepository } from "@/server/repositories";

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
  const profile = await userProfileRepository.getByUserId(getDb(), user.id);

  if (!profile?.onboardingCompletedAt) {
    redirect("/onboarding");
  }

  return <AppShell user={user}>{children}</AppShell>;
}
