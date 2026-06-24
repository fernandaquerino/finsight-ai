import type {
  AccountTypeValue,
  CategoryKey,
  CurrencyCode,
  GoalKey,
} from "./data/catalog";

export type OnboardingAccountDraft = Readonly<{
  id: string;
  name: string;
  type: AccountTypeValue;
  initialBalance?: number;
}>;

export type OnboardingState = {
  name: string;
  currency: CurrencyCode;
  trackingStartMonth: Date;
  goal: GoalKey | null;
  categoryKeys: CategoryKey[];
  accounts: OnboardingAccountDraft[];
  aiConsent: boolean;
};

// Ordem dos passos do wizard. O passo de consentimento ("consent") foi
// adicionado ao design original (que tinha 6) por exigência de LGPD.
export const ONBOARDING_STEPS = [
  { id: "welcome", label: "Boas-vindas" },
  { id: "profile", label: "Perfil" },
  { id: "goal", label: "Objetivo" },
  { id: "categories", label: "Categorias" },
  { id: "accounts", label: "Contas" },
  { id: "consent", label: "Privacidade" },
  { id: "ready", label: "Pronto" },
] as const;

export type OnboardingStepId = (typeof ONBOARDING_STEPS)[number]["id"];
