// DTO devolvido por GET /api/settings. Espelha o tipo de retorno de
// server/services/settings/get-settings — é a borda da aplicação, então o tipo
// é explícito em vez de inferido.
export type SettingsAccount = {
  id: string;
  name: string;
  type: AccountType;
  institution: string | null;
  createdAt: string;
};

export const accountTypes = [
  "checking",
  "savings",
  "credit_card",
  "investment",
  "other",
] as const;

export type AccountType = (typeof accountTypes)[number];

export const accountTypeLabels: Record<AccountType, string> = {
  checking: "Conta corrente",
  savings: "Poupança",
  credit_card: "Cartão de crédito",
  investment: "Investimentos",
  other: "Carteira",
};

export type SettingsProfile = {
  name: string | null;
  email: string;
  image: string | null;
  phone: string | null;
  // Nunca o CPF em claro: o servidor só devolve a versão mascarada.
  cpfMasked: string | null;
  hasCpf: boolean;
  signInProvider: string;
  hasPassword: boolean;
  memberSince: string;
};

export type NotificationSettings = {
  spendAlerts: boolean;
  weeklySummary: boolean;
  installmentReminders: boolean;
};

export type AiSettings = {
  consentGivenAt: string | null;
  autoCategorize: boolean;
  proactiveInsights: boolean;
};

export type Settings = {
  profile: SettingsProfile;
  ai: AiSettings;
  notifications: NotificationSettings;
  accounts: SettingsAccount[];
};

export type UpdateSettingsPayload = {
  name?: string;
  phone?: string | null;
  cpf?: string | null;
  aiAutoCategorize?: boolean;
  aiProactiveInsights?: boolean;
  notifications?: Partial<NotificationSettings>;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type CreateAccountPayload = {
  name: string;
  type: AccountType;
  institution: string | null;
  initialBalance: number | null;
};
