import { z } from "zod";

import { accountType } from "@/../db/schema";

// Limite alinhado à coluna numeric(14,2) de accounts.initial_balance.
const MAX_AMOUNT = 999_999_999_999.99;

const nameSchema = z
  .string()
  .trim()
  .min(1, "nome é obrigatório")
  .max(120, "nome muito longo");

// Telefone livre: formatos brasileiros e internacionais convivem, e uma regex
// rígida rejeita números válidos. Só garantimos tamanho e caracteres plausíveis.
// String vazia vira null — é assim que o usuário limpa o campo.
const phoneSchema = z
  .string()
  .trim()
  .max(24, "telefone muito longo")
  .regex(/^[\d\s()+-]*$/, "use apenas números, espaços, parênteses, + e -")
  .transform((value) => (value === "" ? null : value))
  .nullable();

const CPF_LENGTH = 11;

// Dígitos verificadores do CPF. Validar aqui evita gravar um número que nunca
// serviria para nada — e é a única forma de o campo ter algum valor.
function hasValidCpfCheckDigits(digits: string): boolean {
  const numbers = digits.split("").map(Number);

  for (const checkIndex of [9, 10] as const) {
    let sum = 0;
    for (let i = 0; i < checkIndex; i += 1) {
      sum += (numbers[i] as number) * (checkIndex + 1 - i);
    }
    const remainder = (sum * 10) % 11;
    const expected = remainder === 10 ? 0 : remainder;

    if (expected !== numbers[checkIndex]) {
      return false;
    }
  }

  return true;
}

// PII sensível: as mensagens de erro nunca ecoam o valor recebido.
const cpfSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/\D/g, ""))
  .refine(
    (digits) => digits === "" || digits.length === CPF_LENGTH,
    "o CPF deve ter 11 dígitos",
  )
  .refine(
    (digits) => digits === "" || !/^(\d)\1{10}$/.test(digits),
    "CPF inválido",
  )
  .refine(
    (digits) => digits === "" || hasValidCpfCheckDigits(digits),
    "CPF inválido",
  )
  .transform((digits) => (digits === "" ? null : digits))
  .nullable();

const notificationPreferencesSchema = z
  .object({
    spendAlerts: z.boolean(),
    weeklySummary: z.boolean(),
    installmentReminders: z.boolean(),
  })
  .partial()
  .refine(
    (value) => Object.keys(value).length > 0,
    "envie ao menos uma preferência de notificação",
  );

// userId nunca vem daqui — é resolvido da sessão no servidor.
// Um único PATCH cobre dados pessoais e preferências: a tela salva um campo por
// vez, e um endpoint por toggle não pagaria o próprio custo.
export const updateSettingsSchema = z
  .object({
    name: nameSchema,
    phone: phoneSchema,
    cpf: cpfSchema,
    aiAutoCategorize: z.boolean(),
    aiProactiveInsights: z.boolean(),
    notifications: notificationPreferencesSchema,
  })
  .partial()
  .refine(
    (value) => Object.keys(value).length > 0,
    "envie ao menos um campo para atualizar",
  );

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;

// O e-mail não entra aqui de propósito: ele é a identidade da conta e, com OAuth
// e account linking habilitados, trocá-lo sem reverificação permitiria tomar
// outra conta. `Future` — troca de e-mail com confirmação por link.
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "informe a senha atual"),
    newPassword: z
      .string()
      .min(8, "a nova senha precisa de ao menos 8 caracteres")
      .max(200, "senha muito longa")
      .regex(/[A-Za-z]/, "use ao menos uma letra")
      .regex(/\d/, "use ao menos um número"),
    confirmPassword: z.string().min(1, "confirme a nova senha"),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "as senhas não coincidem",
    path: ["confirmPassword"],
  })
  .refine((value) => value.newPassword !== value.currentPassword, {
    message: "a nova senha precisa ser diferente da atual",
    path: ["newPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const DELETE_ACCOUNT_CONFIRMATION = "ENCERRAR";

// Type-to-confirm: a palavra exata, sem normalizar caixa. Uma exclusão
// irreversível merece uma confirmação deliberada.
export const deleteAccountSchema = z.object({
  confirmation: z.literal(
    DELETE_ACCOUNT_CONFIRMATION,
    `digite ${DELETE_ACCOUNT_CONFIRMATION} para confirmar`,
  ),
});

export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;

export const createAccountSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "nome da conta é obrigatório")
    .max(60, "nome muito longo"),
  type: z.enum(accountType.enumValues, "tipo de conta inválido"),
  institution: z
    .string()
    .trim()
    .max(60, "nome da instituição muito longo")
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .optional()
    .default(null),
  initialBalance: z
    .number()
    .min(-MAX_AMOUNT, "valor acima do limite suportado")
    .max(MAX_AMOUNT, "valor acima do limite suportado")
    .nullable()
    .optional()
    .default(null),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
