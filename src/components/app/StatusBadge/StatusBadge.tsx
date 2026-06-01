import { SparklesIcon } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

type StatusBadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "ai";

type StatusBadgeProps = Readonly<{
  children: React.ReactNode;
  variant?: StatusBadgeVariant;
  className?: string;
}>;

const statusBadgeClassName: Record<StatusBadgeVariant, string> = {
  success: "border-transparent bg-success-soft text-success",
  warning: "border-transparent bg-warning-soft text-warning",
  danger: "border-transparent bg-danger-soft text-danger",
  info: "border-transparent bg-info-soft text-info",
  neutral: "border-transparent bg-muted text-muted-foreground",
  ai: "border-transparent bg-primary-soft text-primary gap-1 [&_svg]:size-3",
};

function StatusBadge({
  children,
  variant = "neutral",
  className,
}: StatusBadgeProps) {
  return (
    <Badge className={cn(statusBadgeClassName[variant], className)}>
      {variant === "ai" && <SparklesIcon aria-hidden="true" />}
      {children}
    </Badge>
  );
}

export { StatusBadge };
export type { StatusBadgeVariant };
