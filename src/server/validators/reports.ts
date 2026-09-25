import { z } from "zod";

// Granularidade do relatório. O período é ancorado num mês (YYYY-MM): o
// trimestre é o que contém o mês, o ano é o do mês.
export const reportQuerySchema = z.object({
  granularity: z.enum(["monthly", "quarterly", "yearly"]).default("monthly"),
  month: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "deve estar no formato YYYY-MM")
    .optional(),
});

export type ReportQuery = z.infer<typeof reportQuerySchema>;

export const reportExportQuerySchema = reportQuerySchema.extend({
  format: z.enum(["csv", "pdf"]).default("csv"),
});

export type ReportExportQuery = z.infer<typeof reportExportQuerySchema>;
