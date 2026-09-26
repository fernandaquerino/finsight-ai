import { invalidateDashboardCache } from "@/server/services/dashboard/cache";
import { invalidateInsightsCache } from "@/server/services/insights/cache";

// Toda leitura derivada e cacheada do usuário. Uma escrita de transação ou de
// categoria muda métricas do dashboard E os insights (média por categoria,
// orçamento estourado, duplicidade), então invalidar só um dos dois deixa a UI
// mostrando números que não conversam entre si.
export async function invalidateDerivedCaches(userId: string): Promise<void> {
  await Promise.all([
    invalidateDashboardCache(userId),
    invalidateInsightsCache(userId),
  ]);
}
