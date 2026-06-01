import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type EmptyListProps = Readonly<{
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}>;

function EmptyList({ title, description, action, className }: EmptyListProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-md border border-dashed px-6 py-10 text-center",
        className,
      )}
    >
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export { EmptyList };
