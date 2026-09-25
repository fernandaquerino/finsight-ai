import {
  accountRepository,
  notificationPreferenceRepository,
  userProfileRepository,
  userRepository,
  type Database,
} from "@/server/repositories";

import { UserNotFoundError } from "./errors";
import { maskCpf } from "./mask";

export type SettingsAccount = {
  id: string;
  name: string;
  type: string;
  institution: string | null;
  createdAt: string;
};

export type Settings = {
  profile: {
    name: string | null;
    email: string;
    image: string | null;
    phone: string | null;
    // Só a versão mascarada: o CPF em claro nunca sai do servidor.
    cpfMasked: string | null;
    hasCpf: boolean;
    // Provedor de entrada: define se "Alterar senha" faz sentido nesta conta.
    signInProvider: string;
    hasPassword: boolean;
    memberSince: string;
  };
  ai: {
    consentGivenAt: string | null;
    autoCategorize: boolean;
    proactiveInsights: boolean;
  };
  notifications: {
    spendAlerts: boolean;
    weeklySummary: boolean;
    installmentReminders: boolean;
  };
  accounts: SettingsAccount[];
};

// Defaults iguais aos do schema: quem nunca salvou preferências lê os mesmos
// valores que o banco gravaria no primeiro upsert.
const NOTIFICATION_DEFAULTS = {
  spendAlerts: true,
  weeklySummary: true,
  installmentReminders: false,
} as const;

export async function getSettings(
  db: Database,
  userId: string,
): Promise<Settings> {
  const [user, profile, notifications, accounts] = await Promise.all([
    userRepository.findById(db, userId),
    userProfileRepository.getByUserId(db, userId),
    notificationPreferenceRepository.getByUserId(db, userId),
    accountRepository.listByUser(db, userId),
  ]);

  if (!user) {
    throw new UserNotFoundError();
  }

  return {
    profile: {
      name: user.name,
      email: user.email,
      image: user.image,
      phone: profile?.phone ?? null,
      cpfMasked: maskCpf(profile?.cpf ?? null),
      hasCpf: Boolean(profile?.cpf),
      signInProvider: user.oauthProvider,
      hasPassword: Boolean(user.passwordHash),
      memberSince: user.createdAt.toISOString(),
    },
    ai: {
      consentGivenAt: profile?.aiConsentAt?.toISOString() ?? null,
      autoCategorize: profile?.aiAutoCategorize ?? true,
      proactiveInsights: profile?.aiProactiveInsights ?? true,
    },
    notifications: {
      spendAlerts:
        notifications?.spendAlerts ?? NOTIFICATION_DEFAULTS.spendAlerts,
      weeklySummary:
        notifications?.weeklySummary ?? NOTIFICATION_DEFAULTS.weeklySummary,
      installmentReminders:
        notifications?.installmentReminders ??
        NOTIFICATION_DEFAULTS.installmentReminders,
    },
    accounts: accounts.map((account) => ({
      id: account.id,
      name: account.name,
      type: account.type,
      institution: account.institution,
      createdAt: account.createdAt.toISOString(),
    })),
  };
}
