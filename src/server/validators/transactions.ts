import { z } from "zod";

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "deve estar no formato YYYY-MM-DD");

const optionalUuidSchema = z
  .string()
  .uuid("deve ser um UUID válido")
  .optional();

const positiveIntFromString = (defaultValue: number, max?: number) =>
  z.preprocess(
    (value) => {
      if (value === undefined || value === null || value === "") {
        return defaultValue;
      }

      return Number(value);
    },
    z
      .number()
      .int()
      .min(1)
      .pipe(max ? z.number().max(max) : z.number()),
  );

export const transactionsQuerySchema = z
  .object({
    from: dateSchema.optional(),
    to: dateSchema.optional(),
    categoryId: optionalUuidSchema,
    accountId: optionalUuidSchema,
    kind: z.enum(["income", "expense", "transfer"]).optional(),
    search: z.preprocess(
      (value) =>
        typeof value === "string" && value.trim() === "" ? undefined : value,
      z.string().trim().max(120).optional(),
    ),
    page: positiveIntFromString(1),
    limit: positiveIntFromString(25, 100),
  })
  .refine((value) => (value.from && value.to ? value.from <= value.to : true), {
    message: "from não pode ser depois de to",
    path: ["from"],
  });

export type TransactionsQuery = z.infer<typeof transactionsQuerySchema>;

const kindSchema = z.enum(["income", "expense", "transfer"]);

// amount é sempre positivo; `kind` define a direção (despesa/receita).
// Limite alinhado à coluna numeric(14,2) do banco.
const amountSchema = z
  .number()
  .positive("deve ser maior que zero")
  .max(999_999_999_999.99, "valor acima do limite suportado");

const descriptionSchema = z
  .string()
  .trim()
  .min(1, "descrição é obrigatória")
  .max(280, "descrição muito longa");

// Input de criação de transação manual. userId nunca vem daqui — é resolvido
// da sessão no servidor. categoryId é opcional (coluna nullable).
export const createTransactionSchema = z.object({
  accountId: z.string().uuid("conta inválida"),
  categoryId: z.string().uuid("categoria inválida").nullish(),
  amount: amountSchema,
  kind: kindSchema,
  description: descriptionSchema,
  occurredAt: dateSchema,
  currency: z
    .string()
    .length(3, "moeda deve ter 3 letras")
    .toUpperCase()
    .default("BRL"),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

// Input de atualização parcial. Recategorizar (categoryId) e editar campos
// existentes. Pelo menos um campo deve ser enviado.
export const updateTransactionSchema = z
  .object({
    accountId: z.string().uuid("conta inválida"),
    categoryId: z.string().uuid("categoria inválida").nullable(),
    amount: amountSchema,
    kind: kindSchema,
    description: descriptionSchema,
    occurredAt: dateSchema,
  })
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "envie ao menos um campo para atualizar",
  });

export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
