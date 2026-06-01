import type { ReactNode } from "react";
import { SparklesIcon } from "lucide-react";

import { Card, CardEyebrow } from "@/components/ui/Card";
import { SourceReference } from "@/components/app/SourceReference";
import { cn } from "@/lib/utils";

type AIInsightBannerMetric = Readonly<{
  label: string;
  value: string;
}>;

type AIInsightBannerProps = Readonly<{
  label?: string;
  title: string;
  description: string;
  metric?: AIInsightBannerMetric;
  source?: string;
  actionSlot?: ReactNode;
  className?: string;
}>;

function AIInsightBanner({
  label = "ANÁLISE DA IA",
  title,
  description,
  metric,
  source,
  actionSlot,
  className,
}: AIInsightBannerProps) {
  return (
    <Card variant="ai" className={cn("flex items-start gap-4", className)}>
      {/* Icon */}
      <div
        className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground"
        aria-hidden="true"
      >
        <SparklesIcon className="size-5" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <CardEyebrow className="text-primary">{label}</CardEyebrow>

        <h2 className="mt-1 text-base font-semibold text-foreground">
          {title}
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>

        {source && <SourceReference className="mt-2">{source}</SourceReference>}

        {actionSlot && <div className="mt-3">{actionSlot}</div>}
      </div>

      {/* Metric (right side) */}
      {metric && (
        <div className="shrink-0 text-right">
          <CardEyebrow>{metric.label}</CardEyebrow>
          <p className="mt-1 font-mono text-lg font-bold text-primary tabular-nums">
            {metric.value}
          </p>
        </div>
      )}
    </Card>
  );
}

export { AIInsightBanner };
export type { AIInsightBannerMetric, AIInsightBannerProps };
