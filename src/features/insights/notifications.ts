import { appRoutes } from "@/lib/app-routes";
import type { Notification } from "@/components/app/NotificationsPanel";
import type { Insight, InsightKind } from "@/features/insights/types";

// Nem todo insight merece uma notificação: orçamento estourado e duplicidade são
// eventos com prazo ("aja agora"); média histórica e nova recorrência são
// contexto, que o usuário lê quando abre a tela de insights.
const NOTIFIABLE_KINDS = new Set<InsightKind>([
  "possible-duplicate",
  "budget-overrun",
  "recurring-charges",
  "goal-behind",
]);

const NOTIFICATION_TYPE_BY_KIND = {
  "possible-duplicate": "budget",
  "budget-overrun": "budget",
  "recurring-charges": "ai",
  "goal-behind": "goal",
  "category-above-average": "ai",
  "new-recurring": "ai",
} as const satisfies Record<InsightKind, Notification["type"]>;

// Mapeia insights para a central de notificações. Puro e testável.
// `caption` no lugar de um timestamp: a análise é recalculada a cada leitura,
// então "há 2 horas" seria inventar uma data que não existe.
export function insightsToNotifications(
  insights: readonly Insight[],
  monthLabel: string,
): readonly Notification[] {
  return insights
    .filter((insight) => NOTIFIABLE_KINDS.has(insight.kind))
    .map((insight) => ({
      id: insight.id,
      type: NOTIFICATION_TYPE_BY_KIND[insight.kind],
      title: insight.title,
      description: insight.reason,
      caption: `análise de ${monthLabel}`,
      unread: true,
      href: `${appRoutes.insights}?severity=${insight.severity}`,
    }));
}
