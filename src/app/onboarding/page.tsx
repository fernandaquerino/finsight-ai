import { redirect } from "next/navigation";

import { OnboardingWizard } from "@/features/onboarding/components/OnboardingWizard";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/server/auth/session";
import { userProfileRepository } from "@/server/repositories";

export default async function OnboardingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await userProfileRepository.getByUserId(getDb(), user.id);

  // Já concluiu o onboarding → vai direto ao dashboard (não repetir).
  if (profile?.onboardingCompletedAt) {
    redirect("/");
  }

  return <OnboardingWizard initialName={user.name} />;
}
