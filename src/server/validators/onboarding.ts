import { z } from "zod";

import {
  ACCOUNT_TYPE_VALUES,
  CATEGORY_KEYS,
  CURRENCY_CODES,
  GOAL_KEYS,
} from "@/features/onboarding/data/catalog";

// Conta criada no onboarding. initialBalance opcional; validado como número >= 0
// e convertido para string (numeric) na camada de service.
const onboardingAccountSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome da conta").max(80),
  type: z.enum(ACCOUNT_TYPE_VALUES),
  initialBalance: z.number().min(0).optional(),
});

export const onboardingSchema = z.object({
  name: z.string().trim().min(1, "Informe seu nome").max(80),
  currency: z.enum(CURRENCY_CODES),
  // Primeiro dia do mês inicial de acompanhamento (YYYY-MM-DD).
  trackingStartMonth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida")
    .optional(),
  primaryGoal: z.enum(GOAL_KEYS),
  // Chaves do catálogo; o servidor resolve nome/cor/kind (não confia no cliente).
  categoryKeys: z.array(z.enum(CATEGORY_KEYS)).max(CATEGORY_KEYS.length),
  accounts: z.array(onboardingAccountSchema).max(20),
  // Consentimento explícito de IA/privacidade (passo de consentimento).
  aiConsent: z.boolean(),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type OnboardingAccountInput = z.infer<typeof onboardingAccountSchema>;
