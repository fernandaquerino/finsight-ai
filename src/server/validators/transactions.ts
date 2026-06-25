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
