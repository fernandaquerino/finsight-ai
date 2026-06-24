import { redirect } from "next/navigation";

import { AppShell } from "@/components/app/AppShell";
import { getDb } from "@/lib/db";
import { UnauthorizedError, requireUserId } from "@/server/auth/session";
import { userProfileRepository } from "@/server/repositories";

type AppLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default async function AppLayout({ children }: AppLayoutProps) {
  let userId: string;

  try {
    userId = await requireUserId();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect("/login");
    }

    throw error;
  }

  // Força o onboarding antes de qualquer tela autenticada. /onboarding fica
  // fora do grupo (app), então não há loop de redirecionamento.
  const profile = await userProfileRepository.getByUserId(getDb(), userId);

  if (!profile?.onboardingCompletedAt) {
    redirect("/onboarding");
  }

  return <AppShell>{children}</AppShell>;
}
