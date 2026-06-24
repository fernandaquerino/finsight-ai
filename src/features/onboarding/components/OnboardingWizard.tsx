"use client";

import { useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";

import { Logo } from "@/components/app/Icons/Logo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

import { skipOnboarding, submitOnboarding } from "../actions";
import type { CategoryKey, CurrencyCode, GoalKey } from "../data/catalog";
import type { OnboardingAccountDraft, OnboardingState } from "../types";
import { ONBOARDING_STEPS } from "../types";
import { OnboardingProgress } from "./OnboardingProgress";
import { AccountsStep } from "./steps/AccountsStep";
import { CategoriesStep } from "./steps/CategoriesStep";
import { ConsentStep } from "./steps/ConsentStep";
import { GoalStep } from "./steps/GoalStep";
import { ProfileStep } from "./steps/ProfileStep";
import { ReadyStep } from "./steps/ReadyStep";
import { WelcomeStep } from "./steps/WelcomeStep";

function toMonthStart(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}

type OnboardingWizardProps = Readonly<{
  initialName?: string | null;
}>;

export function OnboardingWizard({ initialName }: OnboardingWizardProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<OnboardingState>(() => ({
    name: initialName?.trim() ?? "",
    currency: "BRL",
    trackingStartMonth: new Date(),
    goal: null,
    categoryKeys: [],
    accounts: [],
    aiConsent: false,
  }));

  const step = ONBOARDING_STEPS[stepIndex] ?? ONBOARDING_STEPS[0];
  const isLastStep = stepIndex === ONBOARDING_STEPS.length - 1;

  function update<K extends keyof OnboardingState>(
    key: K,
    value: OnboardingState[K],
  ) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  function goNext() {
    setStepIndex((index) => Math.min(index + 1, ONBOARDING_STEPS.length - 1));
  }

  function goBack() {
    setStepIndex((index) => Math.max(index - 1, 0));
  }

  function toggleCategory(key: CategoryKey) {
    setState((prev) => ({
      ...prev,
      categoryKeys: prev.categoryKeys.includes(key)
        ? prev.categoryKeys.filter((item) => item !== key)
        : [...prev.categoryKeys, key],
    }));
  }

  function addAccount(account: Omit<OnboardingAccountDraft, "id">) {
    setState((prev) => ({
      ...prev,
      accounts: [...prev.accounts, { ...account, id: crypto.randomUUID() }],
    }));
  }

  function removeAccount(id: string) {
    setState((prev) => ({
      ...prev,
      accounts: prev.accounts.filter((account) => account.id !== id),
    }));
  }

  function handleSkip() {
    startTransition(async () => {
      await skipOnboarding();
    });
  }

  function handleSubmit() {
    if (!state.goal) {
      return;
    }

    startTransition(async () => {
      await submitOnboarding({
        name: state.name.trim(),
        currency: state.currency,
        trackingStartMonth: toMonthStart(state.trackingStartMonth),
        primaryGoal: state.goal as GoalKey,
        categoryKeys: state.categoryKeys,
        accounts: state.accounts.map((account) => ({
          name: account.name,
          type: account.type,
          initialBalance: account.initialBalance,
        })),
        aiConsent: state.aiConsent,
      });
    });
  }

  const canContinueProfile = state.name.trim().length > 0;

  return (
    <main className="flex min-h-screen flex-col bg-background px-4 py-8">
      <header className="mx-auto flex w-full max-w-xl items-center justify-between">
        <Logo className="h-7 w-auto" />
        {!isLastStep && (
          <Button
            variant="link"
            size="sm"
            onClick={handleSkip}
            disabled={isPending}
            className="text-muted-foreground hover:text-foreground"
          >
            Pular configuração
            <ArrowRight />
          </Button>
        )}
      </header>

      <div className="mx-auto mt-8 flex w-full max-w-xl flex-col gap-5">
        <OnboardingProgress
          currentStep={stepIndex + 1}
          totalSteps={ONBOARDING_STEPS.length}
          stepLabel={step.label}
        />

        <Card className="p-6">
          {step.id === "welcome" && <WelcomeStep name={state.name} />}
          {step.id === "profile" && (
            <ProfileStep
              name={state.name}
              currency={state.currency}
              trackingStartMonth={state.trackingStartMonth}
              onNameChange={(value) => update("name", value)}
              onCurrencyChange={(value: CurrencyCode) =>
                update("currency", value)
              }
              onTrackingStartMonthChange={(value) =>
                update("trackingStartMonth", value)
              }
            />
          )}
          {step.id === "goal" && (
            <GoalStep
              selected={state.goal}
              onSelect={(goal: GoalKey) => update("goal", goal)}
            />
          )}
          {step.id === "categories" && (
            <CategoriesStep
              selected={state.categoryKeys}
              onToggle={toggleCategory}
            />
          )}
          {step.id === "accounts" && (
            <AccountsStep
              accounts={state.accounts}
              onAdd={addAccount}
              onRemove={removeAccount}
            />
          )}
          {step.id === "consent" && (
            <ConsentStep
              consent={state.aiConsent}
              onChange={(value) => update("aiConsent", value)}
            />
          )}
          {step.id === "ready" && (
            <ReadyStep
              name={state.name}
              goal={state.goal}
              categoryKeys={state.categoryKeys}
              accounts={state.accounts}
            />
          )}
        </Card>

        <Footer>
          {step.id === "welcome" && (
            <Button className="ml-auto" onClick={goNext}>
              Começar configuração
              <ArrowRight />
            </Button>
          )}

          {step.id === "profile" && (
            <>
              <BackButton onClick={goBack} />
              <div className="flex items-center gap-2">
                <Button variant="link" size="sm" onClick={goNext}>
                  Pular por enquanto
                </Button>
                <Button onClick={goNext} disabled={!canContinueProfile}>
                  Continuar
                  <ArrowRight />
                </Button>
              </div>
            </>
          )}

          {step.id === "goal" && (
            <>
              <BackButton onClick={goBack} />
              <Button onClick={goNext} disabled={!state.goal}>
                Continuar
                <ArrowRight />
              </Button>
            </>
          )}

          {step.id === "categories" && (
            <>
              <BackButton onClick={goBack} />
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {state.categoryKeys.length} selecionadas
                </span>
                <Button onClick={goNext}>
                  Continuar
                  <ArrowRight />
                </Button>
              </div>
            </>
          )}

          {step.id === "accounts" && (
            <>
              <BackButton onClick={goBack} />
              <div className="flex items-center gap-2">
                <Button variant="link" size="sm" onClick={goNext}>
                  Pular por enquanto
                </Button>
                <Button onClick={goNext}>
                  Continuar
                  <ArrowRight />
                </Button>
              </div>
            </>
          )}

          {step.id === "consent" && (
            <>
              <BackButton onClick={goBack} />
              <Button onClick={goNext}>
                Continuar
                <ArrowRight />
              </Button>
            </>
          )}

          {step.id === "ready" && (
            <>
              <Button
                variant="secondary"
                onClick={handleSubmit}
                disabled={isPending}
              >
                <Plus />
                Adicionar transação
              </Button>
              <Button onClick={handleSubmit} loading={isPending}>
                Ir para o dashboard
                <ArrowRight />
              </Button>
            </>
          )}
        </Footer>
      </div>
    </main>
  );
}

function Footer({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex items-center justify-between gap-3">{children}</div>
  );
}

function BackButton({ onClick }: Readonly<{ onClick: () => void }>) {
  return (
    <Button variant="secondary" onClick={onClick}>
      <ArrowLeft />
      Voltar
    </Button>
  );
}
