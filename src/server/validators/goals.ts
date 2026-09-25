import { z } from "zod";

import { goalIconKeys, type GoalIconKey } from "@/lib/goals";

// Limite alinhado à coluna numeric(14,2).
const MAX_AMOUNT = 999_999_999_999.99;

const nameSchema = z
  .string()
  .trim()
  .min(1, "nome é obrigatório")
  .max(60, "nome muito longo");

// Ícone restrito à allowlist do app — nunca um nome arbitrário vindo do cliente.
const iconSchema = z.enum(
  goalIconKeys as [GoalIconKey, ...GoalIconKey[]],
  "ícone inválido",
);

const targetAmountSchema = z
  .number()
  .positive("o valor-alvo deve ser maior que zero")
  .max(MAX_AMOUNT, "valor acima do limite suportado");

const currentAmountSchema = z
  .number()
  .min(0, "o valor guardado não pode ser negativo")
  .max(MAX_AMOUNT, "valor acima do limite suportado");

const monthlyContributionSchema = z
  .number()
  .positive("o aporte mensal deve ser maior que zero")
  .max(MAX_AMOUNT, "valor acima do limite suportado")
  .nullable();

// Data-alvo como YYYY-MM-DD. Rejeita datas inexistentes (31/02) porque o
// Postgres também rejeitaria, mas com erro 500 em vez de 422.
const deadlineSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "deve estar no formato YYYY-MM-DD")
  .refine((value) => {
    const [year, month, day] = value.split("-").map(Number);
    if (!year || !month || !day) return false;
    const date = new Date(year, month - 1, day);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }, "data inválida")
  .nullable();

// userId nunca vem daqui — é resolvido da sessão no servidor.
export const createGoalSchema = z.object({
  name: nameSchema,
  icon: iconSchema,
  targetAmount: targetAmountSchema,
  currentAmount: currentAmountSchema.default(0),
  monthlyContribution: monthlyContributionSchema.optional().default(null),
  deadline: deadlineSchema.optional().default(null),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;

export const updateGoalSchema = z
  .object({
    name: nameSchema,
    icon: iconSchema,
    targetAmount: targetAmountSchema,
    currentAmount: currentAmountSchema,
    monthlyContribution: monthlyContributionSchema,
    deadline: deadlineSchema,
  })
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "envie ao menos um campo para atualizar",
  });

export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
