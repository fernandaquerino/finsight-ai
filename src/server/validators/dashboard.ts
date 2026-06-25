import { z } from "zod";

// Período do dashboard. `from`/`to` são datas locais (YYYY-MM-DD), inclusivas.
// Ambos opcionais — quando ausentes, o service assume o mês corrente.
export const dashboardQuerySchema = z
  .object({
    from: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "from deve estar no formato YYYY-MM-DD")
      .optional(),
    to: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "to deve estar no formato YYYY-MM-DD")
      .optional(),
  })
  .refine((value) => (value.from && value.to ? value.from <= value.to : true), {
    message: "from não pode ser depois de to",
    path: ["from"],
  });

export type DashboardQuery = z.infer<typeof dashboardQuerySchema>;
