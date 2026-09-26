"use client";

import type { ElementType } from "react";
import {
  ArrowRightIcon,
  CopyIcon,
  RepeatIcon,
  SparklesIcon,
  TargetIcon,
  TrendingUpIcon,
  WalletIcon,
} from "lucide-react";

import { AIResponseFeedback } from "@/components/app/AIResponseFeedback";
import { SourceReference } from "@/components/app/SourceReference";
import { StatusBadge } from "@/components/app/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import type {
  Insight,
  InsightImpactDirection,
  InsightKind,
  InsightSeverity,
} from "@/features/insights/types";

type InsightCardProps = Readonly<{
  insight: Insight;
  onOpenDetail: (insight: Insight) => void;
  className?: string;
}>;

// Severidade define o tom visual e o rótulo. Único mapa em todo o app — a tela,
// os filtros e o banner do dashboard leem daqui.
const severityConfig = {
  risk: {
    label: "Risco",
    badgeVariant: "danger",
    iconClassName: "bg-danger-soft text-danger",
  },
  opportunity: {
    label: "Oportunidade",
    badgeVariant: "success",
    iconClassName: "bg-success-soft text-success",
  },
  attention: {
    label: "Atenção",
    badgeVariant: "warning",
    iconClassName: "bg-warning-soft text-warning",
  },
  info: {
    label: "Informativo",
    badgeVariant: "info",
    iconClassName: "bg-info-soft text-info",
  },
} as const satisfies Record<
  InsightSeverity,
  {
    label: string;
    badgeVariant: "success" | "warning" | "danger" | "info";
    iconClassName: string;
  }
>;

const kindIcon = {
  "recurring-charges": RepeatIcon,
  "new-recurring": SparklesIcon,
  "category-above-average": TrendingUpIcon,
  "possible-duplicate": CopyIcon,
  "budget-overrun": WalletIcon,
  "goal-behind": TargetIcon,
} as const satisfies Record<InsightKind, ElementType>;

// O destaque numérico segue a direção do impacto, não a severidade: dinheiro a
// recuperar é verde mesmo num insight de atenção.
const impactClassName: Record<InsightImpactDirection, string> = {
  savings: "bg-success-soft text-success",
  overspend: "bg-warning-soft text-warning",
  review: "bg-danger-soft text-danger",
  none: "bg-muted text-muted-foreground",
};

function InsightCard({ insight, onOpenDetail, className }: InsightCardProps) {
  const config = severityConfig[insight.severity];
  const Icon = kindIcon[insight.kind];

  return (
    <Card className={cn("flex flex-col", className)}>
      <div className="flex items-center gap-1.5">
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg",
            config.iconClassName,
          )}
          aria-hidden="true"
        >
          <Icon className="size-4" />
        </div>

        <StatusBadge variant={config.badgeVariant}>{config.label}</StatusBadge>
      </div>

      <div className="mt-3">
        <h3 className="text-sm font-semibold text-foreground">
          {insight.title}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {insight.reason}
        </p>
      </div>

      <div className="mt-3">
        <span
          className={cn(
            "rounded-md px-2 py-0.5 text-xs font-semibold",
            impactClassName[insight.impactDirection],
          )}
        >
          {insight.impactLabel}
        </span>
      </div>

      <SourceReference className="mt-3">{insight.source}</SourceReference>

      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 text-primary"
          onClick={() => onOpenDetail(insight)}
        >
          Ver detalhes
          <ArrowRightIcon aria-hidden="true" />
        </Button>

        <AIResponseFeedback />
      </div>
    </Card>
  );
}

export { InsightCard, severityConfig };
export type { InsightCardProps };
