import { SparklesIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type AIThinkingStateProps = Readonly<{
  message?: string;
  className?: string;
}>;

function AIThinkingState({
  message = "Analisando seus dados...",
  className,
}: AIThinkingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={message}
      className={cn(
        "flex items-center gap-2 text-sm text-muted-foreground",
        className,
      )}
    >
      <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <SparklesIcon className="size-3.5 animate-pulse" aria-hidden="true" />
      </div>

      <span>{message}</span>

      <span className="flex gap-0.5" aria-hidden="true">
        <span className="size-1 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
        <span className="size-1 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
        <span className="size-1 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
      </span>
    </div>
  );
}

export { AIThinkingState };
export type { AIThinkingStateProps };
