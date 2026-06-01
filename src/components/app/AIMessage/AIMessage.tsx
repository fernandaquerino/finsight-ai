import { SparklesIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type AIMessageVariant = "user" | "assistant" | "system";

type AIMessageProps = Readonly<{
  variant: AIMessageVariant;
  children: React.ReactNode;
  className?: string;
}>;

function AIMessage({ variant, children, className }: AIMessageProps) {
  if (variant === "system") {
    return (
      <div className={cn("flex justify-center py-2", className)}>
        <p className="rounded-md bg-muted px-3 py-1 text-xs text-muted-foreground">
          {children}
        </p>
      </div>
    );
  }

  if (variant === "user") {
    return (
      <div className={cn("flex justify-end", className)}>
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-muted px-4 py-2.5 text-sm text-foreground">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-start gap-2.5", className)}>
      <div
        className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground"
        aria-hidden="true"
      >
        <SparklesIcon className="size-3.5" />
      </div>

      <div
        aria-live="polite"
        className="min-w-0 flex-1 text-sm text-foreground"
      >
        {children}
      </div>
    </div>
  );
}

export { AIMessage };
export type { AIMessageProps, AIMessageVariant };
