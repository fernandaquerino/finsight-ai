import { z } from "zod";

import { categoryKeys, type CategoryKey } from "@/lib/categories";

const nameSchema = z
  .string()
  .trim()
  .min(1, "nome é obrigatório")
  .max(40, "nome muito longo");

// Só aceita hex de 6 dígitos (coluna varchar(7)). Normaliza para maiúsculas
// para manter o mapa de cores estável.
const colorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "cor inválida")
  .transform((value) => value.toUpperCase());

// Ícone restrito à allowlist do app — nunca um nome arbitrário vindo do cliente.
const iconSchema = z.enum(
  categoryKeys as [CategoryKey, ...CategoryKey[]],
  "ícone inválido",
);

// Limite alinhado à coluna numeric(14,2). null remove o orçamento.
const monthlyBudgetSchema = z
  .number()
  .positive("orçamento deve ser maior que zero")
  .max(999_999_999_999.99, "valor acima do limite suportado")
  .nullable();

// userId nunca vem daqui — é resolvido da sessão no servidor.
export const createCategorySchema = z.object({
  name: nameSchema,
  color: colorSchema,
  icon: iconSchema,
  kind: z.enum(["income", "expense"]),
  monthlyBudget: monthlyBudgetSchema.optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

// `kind` é imutável após a criação: mudar o tipo deixaria as transações já
// vinculadas incoerentes (despesa numa categoria de receita).
export const updateCategorySchema = z
  .object({
    name: nameSchema,
    color: colorSchema,
    icon: iconSchema,
    monthlyBudget: monthlyBudgetSchema,
  })
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "envie ao menos um campo para atualizar",
  });

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

// Edição em lote dos limites: só o orçamento muda. Cada item traz o id da
// categoria — a propriedade é verificada no servidor, nunca confiada ao cliente.
export const updateCategoryBudgetsSchema = z.object({
  budgets: z
    .array(
      z.object({
        id: z.string().uuid("categoria inválida"),
        monthlyBudget: monthlyBudgetSchema,
      }),
    )
    .min(1, "envie ao menos uma categoria")
    .max(200, "envie no máximo 200 categorias por vez")
    .refine(
      (items) => new Set(items.map((item) => item.id)).size === items.length,
      "há categorias repetidas na lista",
    ),
});

export type UpdateCategoryBudgetsInput = z.infer<
  typeof updateCategoryBudgetsSchema
>;

export const categoriesSummaryQuerySchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "deve estar no formato YYYY-MM")
    .optional(),
});

export type CategoriesSummaryQuery = z.infer<
  typeof categoriesSummaryQuerySchema
>;
