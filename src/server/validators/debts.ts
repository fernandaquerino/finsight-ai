import { z } from "zod";

// Limite alinhado à coluna numeric(14,2).
const MAX_AMOUNT = 999_999_999_999.99;

export const debtKinds = [
  "credit_card",
  "personal_loan",
  "financing",
  "consumer_credit",
  "other",
] as const;

const nameSchema = z
  .string()
  .trim()
  .min(1, "descrição é obrigatória")
  .max(60, "descrição muito longa");

const kindSchema = z.enum(debtKinds, "tipo de dívida inválido");

const amountSchema = z
  .number()
  .min(0, "valor não pode ser negativo")
  .max(MAX_AMOUNT, "valor acima do limite suportado");

const monthlyPaymentSchema = z
  .number()
  .positive("a parcela deve ser maior que zero")
  .max(MAX_AMOUNT, "valor acima do limite suportado")
  .nullable();

// Juros mensais em pontos percentuais. Coluna numeric(6,3) → 3 casas decimais.
// Teto de 100% a.m.: acima disso é quase certamente erro de digitação.
const interestRateSchema = z
  .number()
  .min(0, "a taxa não pode ser negativa")
  .max(100, "informe a taxa mensal (até 100% a.m.)");

const dueDaySchema = z
  .number()
  .int("informe um dia do mês")
  .min(1, "o dia deve estar entre 1 e 31")
  .max(31, "o dia deve estar entre 1 e 31")
  .nullable();

// Saldo devedor nunca pode passar do valor contratado — a barra de progresso
// ("quanto já foi pago") derivaria de um número negativo.
const remainingWithinTotal = (value: {
  totalAmount?: number;
  remainingAmount?: number;
}) =>
  value.totalAmount === undefined || value.remainingAmount === undefined
    ? true
    : value.remainingAmount <= value.totalAmount;

// userId nunca vem daqui — é resolvido da sessão no servidor.
export const createDebtSchema = z
  .object({
    name: nameSchema,
    kind: kindSchema,
    totalAmount: amountSchema.refine(
      (value) => value > 0,
      "o valor contratado deve ser maior que zero",
    ),
    remainingAmount: amountSchema,
    monthlyPayment: monthlyPaymentSchema.optional().default(null),
    interestRate: interestRateSchema.default(0),
    dueDay: dueDaySchema.optional().default(null),
  })
  .refine(remainingWithinTotal, {
    message: "o saldo devedor não pode ser maior que o valor contratado",
    path: ["remainingAmount"],
  });

export type CreateDebtInput = z.infer<typeof createDebtSchema>;

export const updateDebtSchema = z
  .object({
    name: nameSchema,
    kind: kindSchema,
    totalAmount: amountSchema,
    remainingAmount: amountSchema,
    monthlyPayment: monthlyPaymentSchema,
    interestRate: interestRateSchema,
    dueDay: dueDaySchema,
  })
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "envie ao menos um campo para atualizar",
  })
  .refine(remainingWithinTotal, {
    message: "o saldo devedor não pode ser maior que o valor contratado",
    path: ["remainingAmount"],
  });

export type UpdateDebtInput = z.infer<typeof updateDebtSchema>;

export const debtsSummaryQuerySchema = z.object({
  strategy: z.enum(["avalanche", "snowball"]).default("avalanche"),
  // Aporte extra mensal usado na simulação de quitação.
  extraMonthly: z.coerce
    .number()
    .min(0, "o aporte extra não pode ser negativo")
    .max(MAX_AMOUNT, "valor acima do limite suportado")
    .default(0),
});

export type DebtsSummaryQuery = z.infer<typeof debtsSummaryQuerySchema>;
