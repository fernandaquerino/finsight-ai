"use client";

import { useState } from "react";
import Image from "next/image";
import {
  DatabaseIcon,
  DownloadIcon,
  LandmarkIcon,
  LockIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  UploadIcon,
  WalletIcon,
  XIcon,
} from "lucide-react";

import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { getInitials } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { AddAccountDialog } from "@/features/settings/components/AddAccountDialog";
import { ChangePasswordDialog } from "@/features/settings/components/ChangePasswordDialog";
import { DeleteBankAccountDialog } from "@/features/settings/components/DeleteBankAccountDialog";
import { DeleteUserAccountDialog } from "@/features/settings/components/DeleteUserAccountDialog";
import { EditProfileDialog } from "@/features/settings/components/EditProfileDialog";
import { SettingRow } from "@/features/settings/components/SettingRow";
import { useExportUserData } from "@/features/settings/hooks/useExportUserData";
import { useSettings } from "@/features/settings/hooks/useSettings";
import { useUpdateSettings } from "@/features/settings/hooks/useSettingsMutations";
import {
  accountTypeLabels,
  type Settings,
  type SettingsAccount,
} from "@/features/settings/types";
import { showToast } from "@/lib/toast/toast";

function AccountLoading() {
  return (
    <div
      className="flex flex-col gap-4"
      aria-busy="true"
      aria-label="Carregando sua conta"
    >
      <Skeleton className="h-[108px] rounded-lg" />
      <Skeleton className="h-[204px] rounded-lg" />
      <Skeleton className="h-[136px] rounded-lg" />
      <Skeleton className="h-[136px] rounded-lg" />
    </div>
  );
}

function SectionTitle({
  title,
  description,
  action,
}: Readonly<{
  title: string;
  description?: string;
  action?: React.ReactNode;
}>) {
  return (
    <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-base font-medium text-foreground">{title}</h2>
        {description ? (
          <p className="mt-px text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

function InfoRow({
  label,
  value,
  action,
}: Readonly<{ label: string; value: string; action?: React.ReactNode }>) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3.5">
      <span className="shrink-0 text-dense whitespace-nowrap text-muted-foreground">
        {label}
      </span>
      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate text-body font-medium text-foreground">
          {value}
        </span>
        {action}
      </div>
    </div>
  );
}

// Bloco de identidade do topo: quadrado de 60px com o gradiente da marca
// (#7F77DD → #534AB7, o mesmo do Logo e da tela de login), como no protótipo —
// e não o Avatar redondo, que é o formato usado na topbar e nas listas.
// Quando o usuário tem foto (contas OAuth têm), a foto ganha do gradiente.
function ProfileTile({
  name,
  image,
}: Readonly<{ name: string; image: string | null }>) {
  if (image) {
    return (
      <Image
        src={image}
        alt=""
        aria-hidden="true"
        width={60}
        height={60}
        className="size-[60px] shrink-0 rounded-xl object-cover"
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={name}
      className="grid size-[60px] shrink-0 place-items-center rounded-xl bg-[linear-gradient(135deg,#7f77dd,#534ab7)] text-[22px] font-semibold text-white"
    >
      <span aria-hidden="true">{getInitials(name)}</span>
    </span>
  );
}

const memberSinceFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
});

function ConnectedAccounts({
  accounts,
  onDelete,
}: Readonly<{
  accounts: SettingsAccount[];
  onDelete: (account: SettingsAccount) => void;
}>) {
  if (accounts.length === 0) {
    return (
      <EmptyState
        icon={LandmarkIcon}
        title="Nenhuma conta cadastrada"
        description="Cadastre a conta onde seu dinheiro entra e sai. Não pedimos dados de acesso ao banco — você lança as transações ou importa um extrato."
      />
    );
  }

  return (
    <Card padding="none">
      <ul className="divide-y divide-border">
        {accounts.map((account) => (
          <li key={account.id} className="flex items-center gap-3 px-4 py-3.5">
            <span
              aria-hidden="true"
              className="grid size-9 shrink-0 place-items-center rounded-md bg-primary-soft text-primary"
            >
              {account.type === "other" ? (
                <WalletIcon className="size-4" />
              ) : (
                <LandmarkIcon className="size-4" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-body font-medium text-foreground">
                {account.name}
              </p>
              <p className="text-small text-muted-foreground">
                {accountTypeLabels[account.type]}
              </p>
            </div>
            <Badge variant="info">
              <PencilIcon aria-hidden="true" className="mr-1 size-3" />
              Manual
            </Badge>
            <IconButton
              variant="ghost"
              aria-label={`Remover conta ${account.name}`}
              onClick={() => onDelete(account)}
            >
              <XIcon />
            </IconButton>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function AccountContent({ settings }: Readonly<{ settings: Settings }>) {
  const { profile, accounts } = settings;
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [accountToDelete, setAccountToDelete] =
    useState<SettingsAccount | null>(null);
  const exportUserData = useExportUserData();
  const updateSettings = useUpdateSettings();

  const displayName = profile.name ?? profile.email;
  const memberSince = memberSinceFormatter.format(
    new Date(profile.memberSince),
  );

  function handleExport() {
    exportUserData.mutate(undefined, {
      onSuccess: ({ fileName }) =>
        showToast.success({
          title: "Exportação concluída",
          description: fileName,
        }),
      onError: (error) =>
        showToast.error({
          title: "Não foi possível exportar seus dados",
          description: error instanceof Error ? error.message : undefined,
        }),
    });
  }

  function handleRemoveCpf() {
    updateSettings.mutate(
      { cpf: null },
      {
        onSuccess: () => showToast.success({ title: "CPF removido" }),
        onError: (error) =>
          showToast.error({
            title: "Não foi possível remover o CPF",
            description: error instanceof Error ? error.message : undefined,
          }),
      },
    );
  }

  return (
    <>
      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <ProfileTile name={displayName} image={profile.image} />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-medium text-foreground">
              {displayName}
            </h2>
            <p className="text-dense text-muted-foreground">
              {profile.email} · membro desde {memberSince}
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsEditingProfile(true)}
          >
            <PencilIcon aria-hidden="true" />
            Editar perfil
          </Button>
        </div>
      </Card>

      <SectionTitle title="Dados pessoais" />
      <Card padding="none" className="divide-y divide-border">
        <InfoRow
          label="Nome completo"
          value={profile.name ?? "Não informado"}
        />
        <InfoRow label="E-mail" value={profile.email} />
        <InfoRow label="Telefone" value={profile.phone ?? "Não informado"} />
        <InfoRow
          label="CPF"
          value={profile.cpfMasked ?? "Não informado"}
          action={
            profile.hasCpf ? (
              <Button
                variant="ghost"
                size="sm"
                disabled={updateSettings.isPending}
                onClick={handleRemoveCpf}
              >
                Remover
              </Button>
            ) : null
          }
        />
      </Card>
      <p className="text-xs text-muted-foreground">
        O CPF é opcional e fica guardado mascarado — nem esta tela recebe o
        número completo de volta.
      </p>

      <SectionTitle
        title="Contas conectadas"
        description="Cadastre contas manualmente ou importe um extrato"
        action={
          <div className="flex gap-2">
            {/* Desabilitado, não removido: a tela de importação (/imports) ainda
                não existe, e linkar para 404 é pior que sinalizar que vem aí. */}
            <Button
              variant="ghost"
              size="sm"
              disabled
              title="Disponível quando a tela de importação de extrato estiver pronta"
            >
              <UploadIcon aria-hidden="true" />
              Importar extrato
            </Button>
            <Button size="sm" onClick={() => setIsAddingAccount(true)}>
              <PlusIcon aria-hidden="true" />
              Adicionar conta
            </Button>
          </div>
        }
      />
      <ConnectedAccounts accounts={accounts} onDelete={setAccountToDelete} />

      <SectionTitle title="Segurança" />
      <Card padding="none" className="divide-y divide-border">
        <SettingRow
          icon={LockIcon}
          title="Senha"
          description={
            profile.hasPassword
              ? "Usada para entrar com e-mail e senha"
              : `Você entra por ${profile.signInProvider} — esta conta não usa senha`
          }
          action={
            <Button
              variant="secondary"
              size="sm"
              disabled={!profile.hasPassword}
              onClick={() => setIsChangingPassword(true)}
            >
              Alterar
            </Button>
          }
        />
        <SettingRow
          icon={DatabaseIcon}
          title="Exportar meus dados"
          description="Baixe tudo o que guardamos sobre você em JSON"
          action={
            <Button
              variant="secondary"
              size="sm"
              disabled={exportUserData.isPending}
              onClick={handleExport}
            >
              <DownloadIcon aria-hidden="true" />
              {exportUserData.isPending ? "Gerando…" : "Exportar"}
            </Button>
          }
        />
      </Card>

      <div className="mt-2">
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setIsDeletingUser(true)}
        >
          <Trash2Icon aria-hidden="true" />
          Encerrar conta
        </Button>
      </div>

      <EditProfileDialog
        open={isEditingProfile}
        onOpenChange={setIsEditingProfile}
        profile={profile}
      />
      <AddAccountDialog
        open={isAddingAccount}
        onOpenChange={setIsAddingAccount}
      />
      <ChangePasswordDialog
        open={isChangingPassword}
        onOpenChange={setIsChangingPassword}
      />
      <DeleteBankAccountDialog
        account={accountToDelete}
        onOpenChange={(open) => {
          if (!open) setAccountToDelete(null);
        }}
      />
      <DeleteUserAccountDialog
        open={isDeletingUser}
        onOpenChange={setIsDeletingUser}
        accountCount={accounts.length}
        onExportRequest={handleExport}
      />
    </>
  );
}

function AccountScreen() {
  const settingsQuery = useSettings();

  return (
    <main className="mx-auto flex w-full max-w-[760px] flex-col gap-4 p-5 sm:p-6">
      {settingsQuery.isPending ? (
        <AccountLoading />
      ) : settingsQuery.isError ? (
        <ErrorState
          title="Não foi possível carregar sua conta"
          description="Tente novamente em instantes."
          onRetry={() => void settingsQuery.refetch()}
        />
      ) : (
        <AccountContent settings={settingsQuery.data} />
      )}
    </main>
  );
}

export { AccountScreen };
