import type { ReactNode } from "react";

import { EmptyState } from "@/components/app/EmptyState";

type EmptyListProps = Readonly<{
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}>;

function EmptyList({ title, description, action, className }: EmptyListProps) {
  return (
    <EmptyState
      title={title}
      description={description}
      className={className}
      actionSlot={action}
      variant="generic"
    />
  );
}

export { EmptyList };
