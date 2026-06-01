import type { ReactNode } from "react";
import { CircleAlertIcon } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type ErrorStateProps = Readonly<{
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  secondaryAction?: ReactNode;
  className?: string;
}>;

function ErrorState({
  title = "Não foi possível carregar agora",
  description = "Tente novamente em instantes. Seus dados permanecem seguros.",
  onRetry,
  retryLabel = "Tentar novamente",
  secondaryAction,
  className,
}: ErrorStateProps) {
  return (
    <section
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center rounded-md border border-dashed px-6 py-10 text-center",
        className,
      )}
    >
      <div
        className="mb-4 flex size-11 items-center justify-center rounded-lg bg-warning-soft text-warning"
        aria-hidden="true"
      >
        <CircleAlertIcon className="size-5" />
      </div>
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        {description}
      </p>
      {(onRetry || secondaryAction) && (
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {onRetry && (
            <Button size="sm" onClick={onRetry}>
              {retryLabel}
            </Button>
          )}
          {secondaryAction}
        </div>
      )}
    </section>
  );
}

export { ErrorState };
