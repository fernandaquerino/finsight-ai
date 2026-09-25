"use client";

import Link from "next/link";
import {
  AlertTriangleIcon,
  CheckIcon,
  CreditCardIcon,
  LandmarkIcon,
  LightbulbIcon,
  LockIcon,
  LogOutIcon,
  SparklesIcon,
  SunMoonIcon,
  TargetIcon,
  UserRoundIcon,
} from "lucide-react";

import { ThemeToggle } from "@/components/app/ThemeToggle";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  SettingRow,
  SettingToggle,
} from "@/features/settings/components/SettingRow";
import { useSettings } from "@/features/settings/hooks/useSettings";
import { useUpdateSettings } from "@/features/settings/hooks/useSettingsMutations";
import type { NotificationSettings, Settings } from "@/features/settings/types";
import { appRoutes } from "@/lib/app-routes";
import { showToast } from "@/lib/toast/toast";

function SettingsLoading() {
  return (
    <div
      className="flex flex-col gap-4"
      aria-busy="true"
      aria-label="Carregando configurações"
    >
      {/* Skeleton no shape do conteúdo: 4 cards com 3, 2, 3 e 1 linha. */}
      <Skeleton className="h-[204px] rounded-lg" />
      <Skeleton className="h-[136px] rounded-lg" />
      <Skeleton className="h-[204px] rounded-lg" />
      <Skeleton className="h-[68px] rounded-lg" />
    </div>
  );
}

function SectionTitle({
  title,
  description,
}: Readonly<{ title: string; description?: string }>) {
  return (
    <div className="mt-2 min-w-0">
      <h2 className="text-base font-medium text-foreground">{title}</h2>
      {description ? (
        <p className="mt-px text-xs text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

function SettingsContent({ settings }: Readonly<{ settings: Settings }>) {
  const updateSettings = useUpdateSettings();
  const isSaving = updateSettings.isPending;

  // Um toggle que falha precisa voltar ao valor anterior: a fonte da verdade é
  // o servidor (React Query), então basta invalidar — o onSuccess do hook já faz
  // isso e, no erro, o valor exibido nunca foi alterado localmente.
  function saveAi(
    field: "aiAutoCategorize" | "aiProactiveInsights",
    value: boolean,
    label: string,
  ) {
    updateSettings.mutate(
      { [field]: value },
      {
        onSuccess: () =>
          showToast.success({
            title: value ? `${label} ativado` : `${label} desativado`,
          }),
        onError: (error) =>
          showToast.error({
            title: "Não foi possível salvar",
            description: error instanceof Error ? error.message : undefined,
          }),
      },
    );
  }

  function saveNotification(
    field: keyof NotificationSettings,
    value: boolean,
    label: string,
  ) {
    updateSettings.mutate(
      { notifications: { [field]: value } },
      {
        onSuccess: () =>
          showToast.success({
            title: value ? `${label} ativado` : `${label} desativado`,
          }),
        onError: (error) =>
          showToast.error({
            title: "Não foi possível salvar",
            description: error instanceof Error ? error.message : undefined,
          }),
      },
    );
  }

  const accountCount = settings.accounts.length;
  const hasAiConsent = settings.ai.consentGivenAt !== null;

  return (
    <>
      <Card padding="none" className="divide-y divide-border">
        <SettingRow
          icon={UserRoundIcon}
          title="Perfil"
          description={settings.profile.email}
          action={
            <Button asChild variant="secondary" size="sm">
              <Link href={appRoutes.account}>Editar</Link>
            </Button>
          }
        />
        <SettingRow
          icon={LandmarkIcon}
          title="Contas conectadas"
          description={
            accountCount === 0
              ? "Nenhuma conta cadastrada"
              : `${accountCount} ${accountCount === 1 ? "conta" : "contas"}`
          }
          action={
            <Button asChild variant="secondary" size="sm">
              <Link href={appRoutes.account}>Gerenciar</Link>
            </Button>
          }
        />
        <SettingRow
          icon={LockIcon}
          title="Privacidade e dados"
          description="Seus dados ficam na sua conta e nunca treinam modelos"
          action={
            <Badge variant="success">
              <CheckIcon aria-hidden="true" className="mr-1 size-3" />
              Protegido
            </Badge>
          }
        />
      </Card>

      <SectionTitle
        title="Inteligência"
        description="Como a IA trabalha para você"
      />
      <Card padding="none" className="divide-y divide-border">
        <SettingToggle
          accent
          icon={SparklesIcon}
          title="Categorização automática"
          description="A IA sugere a categoria de novos lançamentos"
          checked={settings.ai.autoCategorize}
          disabled={isSaving || !hasAiConsent}
          onCheckedChange={(value) =>
            saveAi("aiAutoCategorize", value, "Categorização automática")
          }
        />
        <SettingToggle
          accent
          icon={LightbulbIcon}
          title="Insights proativos"
          description="Receber observações sobre gastos e metas"
          checked={settings.ai.proactiveInsights}
          disabled={isSaving || !hasAiConsent}
          onCheckedChange={(value) =>
            saveAi("aiProactiveInsights", value, "Insights proativos")
          }
        />
      </Card>
      {hasAiConsent ? null : (
        <p className="text-xs text-muted-foreground">
          Estes recursos ficam desativados porque você não deu consentimento
          para o processamento por IA no onboarding.
        </p>
      )}

      <SectionTitle title="Notificações" />
      <Card padding="none" className="divide-y divide-border">
        <SettingToggle
          icon={AlertTriangleIcon}
          title="Alertas de gasto"
          description="Quando uma categoria estourar o orçamento"
          checked={settings.notifications.spendAlerts}
          disabled={isSaving}
          onCheckedChange={(value) =>
            saveNotification("spendAlerts", value, "Alertas de gasto")
          }
        />
        <SettingToggle
          icon={TargetIcon}
          title="Lembretes de meta"
          description="Resumo semanal do progresso"
          checked={settings.notifications.weeklySummary}
          disabled={isSaving}
          onCheckedChange={(value) =>
            saveNotification("weeklySummary", value, "Lembretes de meta")
          }
        />
        <SettingToggle
          icon={CreditCardIcon}
          title="Vencimento de dívidas"
          description="Antes de cada parcela"
          checked={settings.notifications.installmentReminders}
          disabled={isSaving}
          onCheckedChange={(value) =>
            saveNotification(
              "installmentReminders",
              value,
              "Vencimento de dívidas",
            )
          }
        />
      </Card>
      <p className="text-xs text-muted-foreground">
        As preferências ficam salvas na sua conta. O envio das notificações em
        si ainda está em construção.
      </p>

      <SectionTitle title="Aparência" />
      <Card padding="none" className="divide-y divide-border">
        <SettingRow
          icon={SunMoonIcon}
          title="Tema"
          description="Claro, escuro ou seguindo o sistema"
          action={<ThemeToggle />}
        />
      </Card>
    </>
  );
}

function SettingsScreen() {
  const settingsQuery = useSettings();

  return (
    <main className="mx-auto flex w-full max-w-[680px] flex-col gap-4 p-5 sm:p-6">
      {settingsQuery.isPending ? (
        <SettingsLoading />
      ) : settingsQuery.isError ? (
        <ErrorState
          title="Não foi possível carregar as configurações"
          description="Tente novamente em instantes."
          onRetry={() => void settingsQuery.refetch()}
        />
      ) : (
        <SettingsContent settings={settingsQuery.data} />
      )}

      <form action="/logout" method="post" className="mt-2">
        <Button type="submit" variant="destructive" size="sm">
          <LogOutIcon aria-hidden="true" />
          Sair da conta
        </Button>
      </form>
    </main>
  );
}

export { SettingsScreen };
