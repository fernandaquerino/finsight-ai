import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

type DataRowProps = Readonly<{
  icon?: ElementType;
  iconClassName?: string;
  title: ReactNode;
  description?: ReactNode;
  value?: ReactNode;
  action?: ReactNode;
  className?: string;
}>;

function DataRow({
  icon: Icon,
  iconClassName,
  title,
  description,
  value,
  action,
  className,
}: DataRowProps) {
  return (
    <li className={cn("flex items-center gap-3 py-3", className)}>
      {Icon && (
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground",
            iconClassName,
          )}
          aria-hidden="true"
        >
          <Icon className="size-4" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{title}</p>
        {description && (
          <p className="truncate text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {value && <div className="shrink-0">{value}</div>}
      {action && <div className="shrink-0">{action}</div>}
    </li>
  );
}

export { DataRow };
