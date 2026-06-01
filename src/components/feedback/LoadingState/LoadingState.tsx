import type { ReactNode } from "react";

import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

type LoadingStateProps = Readonly<{
  label?: string;
  children?: ReactNode;
  className?: string;
}>;

function LoadingState({
  label = "Carregando informações",
  children,
  className,
}: LoadingStateProps) {
  return (
    <div
      aria-busy="true"
      aria-label={label}
      className={cn("space-y-3", className)}
    >
      {children ?? (
        <>
          <Skeleton className="h-4 w-2/5" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-4 w-3/5" />
        </>
      )}
    </div>
  );
}

export { LoadingState };
