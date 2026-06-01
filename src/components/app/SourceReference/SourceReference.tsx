import { DatabaseIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type SourceReferenceProps = Readonly<{
  children: React.ReactNode;
  className?: string;
}>;

function SourceReference({ children, className }: SourceReferenceProps) {
  return (
    <p
      className={cn(
        "flex items-start gap-1.5 text-xs text-muted-foreground",
        className,
      )}
    >
      <DatabaseIcon className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

export { SourceReference };
export type { SourceReferenceProps };
