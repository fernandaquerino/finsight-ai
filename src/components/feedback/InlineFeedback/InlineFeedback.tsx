import {
  CheckCircle2Icon,
  CircleAlertIcon,
  InfoIcon,
  TriangleAlertIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

type InlineFeedbackVariant = "success" | "warning" | "error" | "info";

type InlineFeedbackProps = Readonly<{
  message: string;
  variant?: InlineFeedbackVariant;
  id?: string;
  className?: string;
}>;

const inlineFeedbackConfig = {
  success: {
    icon: CheckCircle2Icon,
    className: "text-success",
  },
  warning: {
    icon: TriangleAlertIcon,
    className: "text-warning",
  },
  error: {
    icon: CircleAlertIcon,
    className: "text-danger",
  },
  info: {
    icon: InfoIcon,
    className: "text-info",
  },
} as const;

function InlineFeedback({
  message,
  variant = "info",
  id,
  className,
}: InlineFeedbackProps) {
  const config = inlineFeedbackConfig[variant];
  const Icon = config.icon;

  return (
    <p
      id={id}
      role={variant === "error" ? "alert" : undefined}
      aria-live={variant === "error" ? undefined : "polite"}
      className={cn(
        "flex items-start gap-1.5 text-xs leading-5",
        config.className,
        className,
      )}
    >
      <Icon className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
}

export { InlineFeedback };
export type { InlineFeedbackVariant };
