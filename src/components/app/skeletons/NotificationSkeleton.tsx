import { Skeleton } from "@/components/ui/Skeleton";

type NotificationSkeletonProps = Readonly<{
  count?: number;
}>;

function NotificationSkeleton({ count = 4 }: NotificationSkeletonProps) {
  return (
    <ul
      aria-busy="true"
      aria-label="Carregando notificações"
      className="divide-y divide-border"
    >
      {Array.from({ length: count }).map((_, index) => (
        <li key={index} className="flex gap-4 px-6 py-4">
          <Skeleton className="size-10 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-3 w-16" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export { NotificationSkeleton };
