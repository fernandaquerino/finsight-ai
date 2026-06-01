import type { ElementType } from "react";
import Link from "next/link";
import {
  ArrowRightIcon,
  CheckIcon,
  RefreshCwIcon,
  SparklesIcon,
  TriangleAlertIcon,
  TrendingUpIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { AIResponseFeedback } from "@/components/app/AIResponseFeedback";
import { SourceReference } from "@/components/app/SourceReference";
import { StatusBadge } from "@/components/app/StatusBadge";
import { cn } from "@/lib/utils";

type AIInsightCardType = "opportunity" | "attention" | "risk" | "info";
type AIInsightCardStatus = "new" | "applied";

type AIInsightCardHighlight = Readonly<{
  value: string;
  variant: "success" | "warning" | "danger";
}>;

type AIInsightCardProps = Readonly<{
  type: AIInsightCardType;
  status?: AIInsightCardStatus;
  title: string;
  description: string;
  icon?: ElementType;
  highlight?: AIInsightCardHighlight;
  source?: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}>;

const insightCardConfig = {
  opportunity: {
    typeLabel: "Oportunidade",
    badgeVariant: "success" as const,
    iconClassName: "bg-success-soft text-success",
    defaultIcon: SparklesIcon,
  },
  attention: {
    typeLabel: "Atenção",
    badgeVariant: "warning" as const,
    iconClassName: "bg-warning-soft text-warning",
    defaultIcon: TrendingUpIcon,
  },
  risk: {
    typeLabel: "Risco",
    badgeVariant: "danger" as const,
    iconClassName: "bg-danger-soft text-danger",
    defaultIcon: TriangleAlertIcon,
  },
  info: {
    typeLabel: "Informativo",
    badgeVariant: "info" as const,
    iconClassName: "bg-info-soft text-info",
    defaultIcon: RefreshCwIcon,
  },
} as const satisfies Record<
  AIInsightCardType,
  {
    typeLabel: string;
    badgeVariant: "success" | "warning" | "danger" | "info";
    iconClassName: string;
    defaultIcon: ElementType;
  }
>;

const highlightClassName: Record<AIInsightCardHighlight["variant"], string> = {
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
};

function AIInsightCard({
  type,
  status = "new",
  title,
  description,
  icon,
  highlight,
  source,
  actionLabel,
  actionHref,
  className,
}: AIInsightCardProps) {
  const config = insightCardConfig[type];
  const Icon = icon ?? config.defaultIcon;

  return (
    <Card className={cn("flex flex-col", className)}>
      {/* Type + status badges */}
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

        <StatusBadge variant={config.badgeVariant}>
          {config.typeLabel}
        </StatusBadge>

        {status === "applied" ? (
          <Badge className="gap-1 border-transparent bg-success-soft text-success [&_svg]:size-3">
            <CheckIcon aria-hidden="true" />
            Aplicado
          </Badge>
        ) : (
          <StatusBadge variant="neutral">Novo</StatusBadge>
        )}
      </div>

      {/* Title + description */}
      <div className="mt-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      {/* Highlight */}
      {highlight && (
        <div className="mt-3">
          <span
            className={cn(
              "rounded-md px-2 py-0.5 text-xs font-semibold",
              highlightClassName[highlight.variant],
            )}
          >
            {highlight.value}
          </span>
        </div>
      )}

      {/* Source */}
      {source && <SourceReference className="mt-3">{source}</SourceReference>}

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between pt-4">
        {actionLabel && actionHref ? (
          <Link
            href={actionHref}
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            <ArrowRightIcon className="size-3.5" aria-hidden="true" />
            {actionLabel}
          </Link>
        ) : (
          <span />
        )}

        <AIResponseFeedback />
      </div>
    </Card>
  );
}

export { AIInsightCard, insightCardConfig };
export type {
  AIInsightCardHighlight,
  AIInsightCardProps,
  AIInsightCardStatus,
  AIInsightCardType,
};
