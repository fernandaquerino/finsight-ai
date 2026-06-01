import type { ReactNode } from "react";

import { EmptyList } from "@/components/app/EmptyList";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

type DataListProps<TItem> = Readonly<{
  items: readonly TItem[];
  renderItem: (item: TItem, index: number) => ReactNode;
  getKey: (item: TItem, index: number) => React.Key;
  ariaLabel: string;
  isLoading?: boolean;
  error?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  loadingCount?: number;
  className?: string;
}>;

function DataList<TItem>({
  items,
  renderItem,
  getKey,
  ariaLabel,
  isLoading = false,
  error,
  emptyTitle = "Nada para mostrar",
  emptyDescription,
  loadingCount = 4,
  className,
}: DataListProps<TItem>) {
  if (isLoading) {
    return (
      <ul
        aria-label={ariaLabel}
        aria-busy="true"
        className={cn("space-y-3", className)}
      >
        {Array.from({ length: loadingCount }).map((_, index) => (
          <li key={index} className="flex items-center gap-3">
            <Skeleton className="size-9 shrink-0 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-2.5 w-1/2" />
            </div>
            <Skeleton className="h-3 w-16 shrink-0" />
          </li>
        ))}
      </ul>
    );
  }

  if (error) {
    return (
      <EmptyList
        title="Não foi possível carregar"
        description={error}
        className={className}
      />
    );
  }

  if (items.length === 0) {
    return (
      <EmptyList
        title={emptyTitle}
        description={emptyDescription}
        className={className}
      />
    );
  }

  return (
    <ul
      aria-label={ariaLabel}
      className={cn("divide-y divide-border", className)}
    >
      {items.map((item, index) => (
        <li key={getKey(item, index)}>{renderItem(item, index)}</li>
      ))}
    </ul>
  );
}

export { DataList };
export type { DataListProps };
