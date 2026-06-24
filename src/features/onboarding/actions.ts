"use server";

import { redirect } from "next/navigation";

import { getDb } from "@/lib/db";
import { requireUserId } from "@/server/auth/session";
import { userProfileRepository } from "@/server/repositories";
import { completeOnboarding } from "@/server/services/onboarding/complete-onboarding";
import {
  onboardingSchema,
  type OnboardingInput,
} from "@/server/validators/onboarding";

export async function submitOnboarding(input: OnboardingInput): Promise<void> {
  const userId = await requireUserId();
  // Revalida no servidor — nunca confiar só na validação do cliente.
  const data = onboardingSchema.parse(input);

  await completeOnboarding(getDb(), userId, data);

  redirect("/");
}

// "Pular configuração": marca o onboarding como concluído sem registrar
// consentimento nem dados. A IA permanece bloqueada até consentir depois.
export async function skipOnboarding(): Promise<void> {
  const userId = await requireUserId();

  await userProfileRepository.upsert(getDb(), userId, {
    onboardingCompletedAt: new Date(),
  });

  redirect("/");
}
