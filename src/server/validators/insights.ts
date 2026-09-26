import { z } from "zod";

// Mês analisado, "YYYY-MM". Ausente → o service assume o mês corrente.
export const insightsQuerySchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "month deve estar no formato YYYY-MM")
    .optional(),
});

export type InsightsQuery = z.infer<typeof insightsQuerySchema>;
